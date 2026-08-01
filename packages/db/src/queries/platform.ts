import {
    AppError,
    CreatePlatform,
    DEFAULT_PAGINATION,
    platformSchema,
    ReorderPlatform,
    slugify,
    UpdatePlatform,
} from "@workspace/config";
import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../client";
import { platforms } from "../schemas";

/** The slug always mirrors the name — clients never send it. */
function withSlug<T extends { name: string }>(values: T): T & { slug: string };
function withSlug<T extends { name?: string }>(
    values: T
): T & { slug?: string };
function withSlug(values: { name?: string }) {
    if (values.name === undefined) return values;

    const slug = slugify(values.name);
    if (!slug)
        throw new AppError("Name must contain at least one letter or number");

    return { ...values, slug };
}

function translateSlugConflict(err: unknown): never {
    if ((err as { code?: string })?.code === "23505")
        throw new AppError(
            "A platform with a similar name already exists",
            "CONFLICT"
        );
    throw err;
}

class PlatformQuery {
    async scan({
        ids,
        isActive,
    }: {
        ids?: string[];
        isActive?: boolean;
    } = {}) {
        const data = await db.query.platforms.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
        });

        return platformSchema.array().parse(data);
    }

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        isActive,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        isActive?: boolean;
    }) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const data = await db.query.platforms.findMany({
            where: {
                AND: [
                    ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
            limit,
            offset: (page - 1) * limit,
            extras: {
                count: db
                    .$count(
                        platforms,
                        and(
                            search?.length
                                ? ilike(platforms.name, `%${search}%`)
                                : undefined,
                            isActive !== undefined
                                ? eq(platforms.isActive, isActive)
                                : undefined
                        )
                    )
                    .as("platform_count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        const parsed = platformSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id }: { id: string }) {
        const data = await db.query.platforms.findFirst({ where: { id } });
        if (!data) return null;
        return platformSchema.parse(data);
    }

    async create(values: CreatePlatform[]) {
        try {
            return await db.transaction(async (tx) => {
                const rows = await tx
                    .select({
                        max: sql<number>`coalesce(max(${platforms.position}), -1)`,
                    })
                    .from(platforms);

                const startAt = (rows[0]?.max ?? -1) + 1;
                const withPositions = values.map((value, index) => ({
                    ...withSlug(value),
                    position: startAt + index,
                }));

                return tx.insert(platforms).values(withPositions).returning();
            });
        } catch (err) {
            translateSlugConflict(err);
        }
    }

    async update({ id, values }: { id: string; values: UpdatePlatform }) {
        try {
            return await db
                .update(platforms)
                .set({ ...withSlug(values), updatedAt: new Date() })
                .where(eq(platforms.id, id))
                .returning()
                .then((res) => res[0]);
        } catch (err) {
            translateSlugConflict(err);
        }
    }

    async reorder({ values }: { values: ReorderPlatform }) {
        if (values.length === 0) return [];

        const data = await db.transaction(async (tx) => {
            return Promise.all(
                values.map(({ id, position }) =>
                    tx
                        .update(platforms)
                        .set({ position, updatedAt: new Date() })
                        .where(eq(platforms.id, id))
                        .returning()
                        .then((res) => res[0])
                )
            );
        });

        return data;
    }

    async bulkUpdate({
        ids,
        values,
    }: {
        ids: string[];
        values: UpdatePlatform;
    }) {
        try {
            const data = await db
                .update(platforms)
                .set({ ...withSlug(values), updatedAt: new Date() })
                .where(inArray(platforms.id, ids))
                .returning();

            return platformSchema.array().parse(data);
        } catch (err) {
            translateSlugConflict(err);
        }
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(platforms)
            .where(inArray(platforms.id, ids))
            .returning();
        return data;
    }
}

export const platformQueries = new PlatformQuery();
