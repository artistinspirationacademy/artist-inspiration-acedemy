import { cache } from "@workspace/cache";
import {
    CResponse,
    DEFAULT_LOG_RETENTION,
    handleError,
    recentLogsQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { type, limit } = recentLogsQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        const config = await queries.configuration.get();
        const retentionDays =
            config?.redisLogRetentionDays ?? DEFAULT_LOG_RETENTION.REDIS_DAYS;

        const data = await cache.logs.recent({
            type,
            limit,
            retentionDays,
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
