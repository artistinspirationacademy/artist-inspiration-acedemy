import {
    CreateFeature,
    DEFAULT_PAGINATION,
    featureSchema,
    ReorderFeature,
    UpdateFeature,
} from "@workspace/config";
import { db } from "../client";
import { features } from "../schemas";
import { and, eq, ilike, inArray, sql } from "drizzle-orm";

class FeatureQuery {
    async scan({
        ids,
        isActive,
    }: {
        ids?: string[];
        isActive?: boolean;
    } = {}) {
        const data = await db.query.features.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
        });

        return featureSchema.array().parse(data);
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

        const data = await db.query.features.findMany({
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
                        features,
                        and(
                            search?.length
                                ? ilike(features.name, `%${search}%`)
                                : undefined,
                            isActive !== undefined
                                ? eq(features.isActive, isActive)
                                : undefined
                        )
                    )
                    .as("feature_count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        const parsed = featureSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id }: { id: string }) {
        const data = await db.query.features.findFirst({ where: { id } });
        if (!data) return null;
        return featureSchema.parse(data);
    }

    async create(values: CreateFeature[]) {
        const data = await db.transaction(async (tx) => {
            const rows = await tx
                .select({
                    max: sql<number>`coalesce(max(${features.position}), -1)`,
                })
                .from(features);

            const startAt = (rows[0]?.max ?? -1) + 1;
            const withPositions = values.map((value, index) => ({
                ...value,
                position: startAt + index,
            }));

            return tx.insert(features).values(withPositions).returning();
        });

        return data;
    }

    async update({ id, values }: { id: string; values: UpdateFeature }) {
        const data = await db
            .update(features)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(features.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async reorder({ values }: { values: ReorderFeature }) {
        if (values.length === 0) return [];

        const data = await db.transaction(async (tx) => {
            return Promise.all(
                values.map(({ id, position }) =>
                    tx
                        .update(features)
                        .set({ position, updatedAt: new Date() })
                        .where(eq(features.id, id))
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
        values: UpdateFeature;
    }) {
        const data = await db
            .update(features)
            .set({ ...values, updatedAt: new Date() })
            .where(inArray(features.id, ids))
            .returning();

        return featureSchema.array().parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(features)
            .where(inArray(features.id, ids))
            .returning();
        return data;
    }
}

export const featureQueries = new FeatureQuery();
