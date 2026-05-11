import {
    BANNER_MEDIA_TYPES,
    bannerContentSchema,
    bannerSchema,
    CreateBanner,
    CreateBannerContent,
    DEFAULT_PAGINATION,
    ReorderBanner,
    UpdateBanner,
} from "@workspace/config";
import { db } from "../client";
import { bannerContent, banners } from "../schemas";
import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import { cache } from "@workspace/cache";

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

        const parsed = bannerSchema.array().parse(data);
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

        const parsed = bannerSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id }: { id: string }) {
        const data = await db.query.banners.findFirst({
            where: { id },
        });
        if (!data) return null;

        const parsed = bannerSchema.parse(data);
        return parsed;
    }

    async create(values: CreateBanner[]) {
        const data = await db.transaction(async (tx) => {
            const rows = await tx
                .select({
                    max: sql<number>`coalesce(max(${banners.position}), -1)`,
                })
                .from(banners);

            const startAt = (rows[0]?.max ?? -1) + 1;
            const withPositions = values.map((value, index) => ({
                ...value,
                position: startAt + index,
            }));

            return tx.insert(banners).values(withPositions).returning();
        });

        await cache.home.drop();
        return data;
    }

    async update({ id, values }: { id: string; values: UpdateBanner }) {
        const data = await db
            .update(banners)
            .set({
                ...values,
                updatedAt: new Date(),
            })
            .where(eq(banners.id, id))
            .returning()
            .then((res) => res[0]);

        await cache.home.drop();
        return data;
    }

    async reorder({ values }: { values: ReorderBanner }) {
        if (values.length === 0) return [];

        const data = await db.transaction(async (tx) => {
            return Promise.all(
                values.map(({ id, position }) =>
                    tx
                        .update(banners)
                        .set({ position, updatedAt: new Date() })
                        .where(eq(banners.id, id))
                        .returning()
                        .then((res) => res[0])
                )
            );
        });

        await cache.home.drop();
        return data;
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(banners)
            .where(inArray(banners.id, ids))
            .returning();

        await cache.home.drop();
        return data;
    }
}

class BannerContentQuery {
    async get() {
        const data = await db.query.bannerContent.findFirst();
        if (!data) return null;

        const parsed = bannerContentSchema.parse(data);
        return parsed;
    }

    async update(values: CreateBannerContent) {
        const existing = await this.get();

        if (existing) {
            const data = await db
                .update(bannerContent)
                .set({
                    ...values,
                    updatedAt: new Date(),
                })
                .where(eq(bannerContent.id, existing.id))
                .returning()
                .then((res) => res[0]);

            await cache.home.drop();

            return data;
        } else {
            const data = await db
                .insert(bannerContent)
                .values(values)
                .returning()
                .then((res) => res[0]);

            await cache.home.drop();
            return data;
        }
    }
}

export const bannerQueries = new BannerQuery();
export const bannerContentQueries = new BannerContentQuery();
