import { utApi } from "@/lib/uploadthing";
import { cache } from "@workspace/cache";
import { DEFAULT_LOG_RETENTION, LogEntry } from "@workspace/config";
import { queries } from "@workspace/db";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDate(d: Date) {
    return d.toISOString().slice(0, 10);
}

function entriesToJsonl(entries: LogEntry[]) {
    return entries.map((e) => JSON.stringify(e)).join("\n");
}

function endOfBucket(date: Date) {
    return new Date(date.getTime() + DAY_MS - 1);
}

export type ArchiveRunResult = {
    uploaded: { key: string; name: string; entries: number }[];
    emptyBucketsDropped: number;
    archivesExpired: number;
};

export async function runArchive(): Promise<ArchiveRunResult> {
    const config = await queries.configuration.get();
    const redisRetention =
        config?.redisLogRetentionDays ?? DEFAULT_LOG_RETENTION.REDIS_DAYS;
    const archiveRetention =
        config?.archiveRetentionDays ?? DEFAULT_LOG_RETENTION.ARCHIVE_DAYS;

    const buckets = await cache.logs.bucketsOlderThan(redisRetention);

    const uploaded: ArchiveRunResult["uploaded"] = [];
    let emptyBucketsDropped = 0;

    for (const { key, date } of buckets) {
        const entries = await cache.logs.drainBucket(key);
        if (entries.length === 0) {
            emptyBucketsDropped++;
            continue;
        }

        const name = `logs-${isoDate(date)}.jsonl`;
        const jsonl = entriesToJsonl(entries);
        const blob = new File([jsonl], name, {
            type: "application/x-ndjson",
        });

        const [result] = await utApi.uploadFiles([blob]);
        if (!result || !result.data) {
            console.error(
                "[archive-logs] upload failed for",
                key,
                result?.error
            );
            continue;
        }

        await queries.logArchive.create({
            name,
            periodStart: date,
            periodEnd: endOfBucket(date),
            entryCount: entries.length,
            fileSize: result.data.size,
            fileKey: result.data.key,
            fileUrl: result.data.ufsUrl,
        });

        uploaded.push({
            key: result.data.key,
            name,
            entries: entries.length,
        });
    }

    const archiveCutoff = new Date(Date.now() - archiveRetention * DAY_MS);
    const expired = await queries.logArchive.olderThan(archiveCutoff);
    if (expired.length > 0) {
        try {
            await utApi.deleteFiles(expired.map((a) => a.fileKey));
        } catch (err) {
            console.error("[archive-logs] failed to delete expired files", err);
        }
        await queries.logArchive.deleteByIds(expired.map((a) => a.id));
    }

    await cache.logs.add({
        type: "cron",
        message: `Archive run: ${uploaded.length} bucket(s) uploaded, ${emptyBucketsDropped} empty bucket(s) dropped, ${expired.length} archive(s) expired`,
        metadata: {
            uploaded,
            expired: expired.map((a) => a.id),
        },
    });

    return {
        uploaded,
        emptyBucketsDropped,
        archivesExpired: expired.length,
    };
}
