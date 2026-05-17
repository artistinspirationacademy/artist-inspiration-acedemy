import { AppError, getClientIp, LogType } from "@workspace/config";
import { redis } from "../client";
import { logsCache } from "./logs";

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetSec: number;
}

const PREFIX = "ratelimit:";

function buildKey(scope: string, identifier: string) {
    return `${PREFIX}${scope}:${identifier}`;
}

class RateLimitCache {
    /**
     * Fixed-window rate limit. Returns `success: true` while the caller is
     * within the allowance for the current window.
     *
     * Fails open on Redis errors — availability is preferred over strict
     * enforcement when the backing store is down.
     */
    async check({
        scope,
        identifier,
        limit,
        windowSec,
    }: {
        scope: string;
        identifier: string;
        limit: number;
        windowSec: number;
    }): Promise<RateLimitResult> {
        const k = buildKey(scope, identifier);
        try {
            const results = await redis
                .multi()
                .incr(k)
                .expire(k, windowSec)
                .ttl(k)
                .exec();

            const count = Number(results?.[0]?.[1] ?? 0);
            const ttlRaw = Number(results?.[2]?.[1] ?? windowSec);
            const resetSec = ttlRaw > 0 ? ttlRaw : windowSec;

            return {
                success: count <= limit,
                limit,
                remaining: Math.max(0, limit - count),
                resetSec,
            };
        } catch (err) {
            console.error("[rateLimit] redis error, failing open", err);
            return {
                success: true,
                limit,
                remaining: limit,
                resetSec: windowSec,
            };
        }
    }

    async reset({
        scope,
        identifier,
    }: {
        scope: string;
        identifier: string;
    }) {
        try {
            await redis.del(buildKey(scope, identifier));
        } catch (err) {
            console.error("[rateLimit] reset failed", err);
        }
    }
}

export const rateLimitCache = new RateLimitCache();

/**
 * Guard a route with a rate limit. If the caller is over the limit, logs a
 * warning and throws AppError("TOO_MANY_REQUESTS"), which `handleError`
 * converts into a 429 response.
 *
 * Pass `identifier` to scope the limit to something other than the client IP
 * (e.g. an email for per-account brute-force protection). When omitted, the
 * client IP is used.
 *
 * Returns the rate-limit result so callers can read remaining quota if they
 * want to expose it to clients.
 */
export async function enforceRateLimit({
    req,
    scope,
    identifier,
    limit,
    windowSec,
    logType = "system",
}: {
    req: Request;
    scope: string;
    identifier?: string;
    limit: number;
    windowSec: number;
    logType?: LogType;
}): Promise<RateLimitResult> {
    const ip = getClientIp(req);
    const id = identifier ?? ip;

    const result = await rateLimitCache.check({
        scope,
        identifier: id,
        limit,
        windowSec,
    });

    if (!result.success) {
        await logsCache.add({
            type: logType,
            level: "warn",
            message: `Rate limit hit: ${scope}`,
            metadata: {
                scope,
                identifier: id,
                ip,
                resetSec: result.resetSec,
            },
        });
        const minutes = Math.max(1, Math.ceil(result.resetSec / 60));
        throw new AppError(
            `Too many requests. Please try again in ${minutes} minute(s).`,
            "TOO_MANY_REQUESTS"
        );
    }

    return result;
}

/**
 * Release the counter for a given scope+identifier — e.g. after a successful
 * login, drop the per-email brute-force counter so honest users aren't punished
 * for prior typos.
 */
export async function resetRateLimit(params: {
    scope: string;
    identifier: string;
}) {
    return rateLimitCache.reset(params);
}
