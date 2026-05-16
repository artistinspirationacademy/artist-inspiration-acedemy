import {
    CreateLog,
    LogEntry,
    LogType,
    logEntrySchema,
    parseToJSON,
} from "@workspace/config";
import { randomUUID } from "crypto";
import { redis } from "../client";

const PREFIX = "logs:";
const DAY_MS = 24 * 60 * 60 * 1000;

function bucketKey(date: Date) {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    return `${PREFIX}${yyyy}-${mm}-${dd}`;
}

function dateFromBucketKey(key: string): Date | null {
    const m = key.match(/^logs:(\d{4}-\d{2}-\d{2})$/);
    if (!m) return null;
    const [y, mo, d] = m[1]!.split("-").map(Number);
    return new Date(Date.UTC(y!, mo! - 1, d!));
}

function startOfDayUTC(d: Date) {
    return new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
}

class LogsCache {
    /**
     * Fire-and-forget log writer. Never throws — logging failures must not
     * break the surrounding request.
     */
    async add(values: CreateLog): Promise<void> {
        try {
            const now = new Date();
            const entry: LogEntry = {
                id: randomUUID(),
                type: values.type,
                level: values.level ?? "info",
                message: values.message,
                actorId: values.actorId ?? null,
                metadata: values.metadata ?? null,
                createdAt: now.toISOString(),
            };

            await redis.zadd(
                bucketKey(now),
                now.getTime(),
                JSON.stringify(entry)
            );
        } catch (err) {
            console.error("[logs] failed to write log entry", err);
        }
    }

    /**
     * Recent logs from the Redis hot window. Reads buckets newest-first,
     * accumulates up to `limit` matching entries, then stops.
     */
    async recent({
        type,
        limit = 100,
        retentionDays,
    }: {
        type?: LogType;
        limit?: number;
        retentionDays: number;
    }): Promise<LogEntry[]> {
        const today = startOfDayUTC(new Date());
        const out: LogEntry[] = [];

        for (let i = 0; i < retentionDays && out.length < limit; i++) {
            const day = new Date(today.getTime() - i * DAY_MS);
            const raw = await redis.zrevrange(bucketKey(day), 0, limit);
            for (const item of raw) {
                if (out.length >= limit) break;
                const parsed = logEntrySchema.safeParse(parseToJSON(item));
                if (!parsed.success) continue;
                if (type && parsed.data.type !== type) continue;
                out.push(parsed.data);
            }
        }

        return out;
    }

    /**
     * Return bucket keys older than `keepDays`. Used by the archive cron.
     */
    async bucketsOlderThan(keepDays: number): Promise<
        { key: string; date: Date }[]
    > {
        const today = startOfDayUTC(new Date());
        const cutoff = new Date(today.getTime() - keepDays * DAY_MS);

        const keys: string[] = [];
        let cursor = "0";
        do {
            const [next, batch] = await redis.scan(
                cursor,
                "MATCH",
                `${PREFIX}*`,
                "COUNT",
                "500"
            );
            cursor = next;
            keys.push(...batch);
        } while (cursor !== "0");

        return keys
            .map((key) => ({ key, date: dateFromBucketKey(key) }))
            .filter(
                (entry): entry is { key: string; date: Date } =>
                    entry.date !== null && entry.date < cutoff
            )
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Drain an entire day-bucket: return all entries newest-first then delete.
     */
    async drainBucket(key: string): Promise<LogEntry[]> {
        const raw = await redis.zrange(key, 0, -1);
        const entries: LogEntry[] = [];
        for (const item of raw) {
            const parsed = logEntrySchema.safeParse(parseToJSON(item));
            if (parsed.success) entries.push(parsed.data);
        }
        await redis.del(key);
        return entries;
    }
}

export const logsCache = new LogsCache();
