import {
    DEFAULT_PAGINATION,
    LogArchive,
    logArchiveSchema,
} from "@workspace/config";
import { desc, inArray, lt } from "drizzle-orm";
import { db } from "../client";
import { logArchives } from "../schemas";

export type CreateLogArchive = {
    name: string;
    periodStart: Date;
    periodEnd: Date;
    entryCount: number;
    fileSize: number;
    fileKey: string;
    fileUrl: string;
};

class LogArchiveQuery {
    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
    }: {
        limit?: number;
        page?: number;
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const extras = {
            count: db.$count(logArchives).as("log_archives_count"),
        };

        const data = await db.query.logArchives.findMany({
            orderBy: { periodStart: "desc" },
            limit,
            offset: (page - 1) * limit,
            extras,
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);
        return {
            data: logArchiveSchema.array().parse(data),
            count,
            pages,
        };
    }

    async scan(): Promise<LogArchive[]> {
        const data = await db.query.logArchives.findMany({
            orderBy: { periodStart: "desc" },
        });
        return logArchiveSchema.array().parse(data);
    }

    async create(values: CreateLogArchive): Promise<LogArchive> {
        const [row] = await db.insert(logArchives).values(values).returning();
        return logArchiveSchema.parse(row);
    }

    async olderThan(cutoff: Date): Promise<LogArchive[]> {
        const data = await db
            .select()
            .from(logArchives)
            .where(lt(logArchives.periodEnd, cutoff));
        return logArchiveSchema.array().parse(data);
    }

    async deleteByIds(ids: string[]) {
        if (!ids.length) return;
        await db.delete(logArchives).where(inArray(logArchives.id, ids));
    }
}

export const logArchiveQueries = new LogArchiveQuery();
