import {
    BANNER_MEDIA_TYPES,
    CreateBanner,
    DEFAULT_PAGINATION,
    mediaSchema,
    UpdateBanner,
} from "@workspace/config";
import { db } from "../client";
import { banners } from "../schemas";
import { and, ilike, eq, inArray } from "drizzle-orm";

class BannerQuery {
    async scan({
        ids,
        mediaType,
        isActive,
    }: {
        ids?: string[];
        mediaType?: (typeof BANNER_MEDIA_TYPES)[number];
        isActive?: boolean;
    } = {}) {
        const data = await db.query.banners.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(mediaType ? [{ mediaType }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
        });

        const parsed = mediaSchema.array().parse(data);
        return parsed;
    }

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        mediaType,
        isActive,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        mediaType?: (typeof BANNER_MEDIA_TYPES)[number];
        isActive?: boolean;
    }) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const data = await db.query.banners.findMany({
            where: {
                AND: [
                    ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
                    ...(mediaType ? [{ mediaType }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
            limit,
            offset: (page - 1) * limit,
            extras: {
                count: db
                    .$count(
                        banners,
                        and(
                            search?.length
                                ? ilike(banners.name, `%${search}%`)
                                : undefined,
                            mediaType
                                ? eq(banners.mediaType, mediaType)
                                : undefined,
                            isActive !== undefined
                                ? eq(banners.isActive, isActive)
                                : undefined
                        )
                    )
                    .as("banner_count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        const parsed = mediaSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id }: { id: string }) {
        const data = await db.query.banners.findFirst({
            where: { id },
        });
        if (!data) return null;

        const parsed = mediaSchema.parse(data);
        return parsed;
    }

    async create(values: CreateBanner[]) {
        const data = await db.insert(banners).values(values).returning();
        return data;
    }

    async update({ id, values }: { id: string; values: UpdateBanner }) {
        const data = await db
            .update(banners)
            .set(values)
            .where(eq(banners.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(banners)
            .where(inArray(banners.id, ids))
            .returning();

        return data;
    }
}

export const bannerQueries = new BannerQuery();
