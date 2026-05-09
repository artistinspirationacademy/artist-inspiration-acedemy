import {
    CreateMedia,
    DEFAULT_PAGINATION,
    Media,
    MEDIA_TYPE_PATTERNS,
    mediaSchema,
    UpdateMedia,
} from "@workspace/config";
import { db } from "../client";
import { media } from "../schemas";
import { and, eq, ilike, inArray, or } from "drizzle-orm";

function getTypeFilter(type: string | undefined) {
    if (!type?.length) return undefined;

    const patterns =
        MEDIA_TYPE_PATTERNS[type as keyof typeof MEDIA_TYPE_PATTERNS];
    if (!patterns) return undefined;

    if (patterns.length === 1) return { ilike: patterns[0]! };
    return { OR: patterns.map((pattern) => ({ ilike: pattern })) };
}

function getTypeFilterSql(type: string | undefined, field: typeof media.type) {
    if (!type?.length) return undefined;

    const patterns =
        MEDIA_TYPE_PATTERNS[type as keyof typeof MEDIA_TYPE_PATTERNS];
    if (!patterns) return undefined;

    if (patterns.length === 1) return ilike(field, patterns[0]!);
    return or(...patterns.map((pattern) => ilike(field, pattern)));
}

class MediaQuery {
    async scan({ ids, type }: { ids?: string[]; type?: string } = {}) {
        const typeFilter = getTypeFilter(type);
        const data = await db.query.media.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(typeFilter ? [{ type: typeFilter }] : []),
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        const parsed = mediaSchema.array().parse(data);
        return parsed;
    }

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        type,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        type?: string;
    }): Promise<PaginationResult<Media>> {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const data = await db.query.media.findMany({
            where: {
                AND: [
                    ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
                    ...(type ? [{ type: getTypeFilter(type) }] : []),
                ],
            },
            limit,
            offset: (page - 1) * limit,
            orderBy: { createdAt: "desc" },
            extras: {
                count: db
                    .$count(
                        media,
                        and(
                            search?.length
                                ? ilike(media.name, `%${search}%`)
                                : undefined,
                            getTypeFilterSql(type, media.type)
                        )
                    )
                    .as("count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        const parsed = mediaSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id, key }: { id?: string; key?: string }) {
        if (!id && !key)
            throw new Error("Either 'id' or 'key' must be provided");

        const data = await db.query.media.findFirst({
            where: {
                OR: [...(id ? [{ id }] : []), ...(key ? [{ key }] : [])],
            },
        });
        if (!data) return null;

        const parsed = mediaSchema.parse(data);
        return parsed;
    }

    async create(values: CreateMedia[]) {
        const data = await db.insert(media).values(values).returning();
        return data;
    }

    async update({ id, values }: { id: string; values: UpdateMedia }) {
        const data = await db
            .update(media)
            .set(values)
            .where(eq(media.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(media)
            .where(inArray(media.id, ids))
            .returning();

        return data;
    }
}

export const mediaQueries = new MediaQuery();
