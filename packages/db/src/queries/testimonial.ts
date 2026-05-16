import {
    CreateTestimonial,
    DEFAULT_PAGINATION,
    fullTestimonialSchema,
    ReorderTestimonial,
    testimonialSchema,
    UpdateTestimonial,
} from "@workspace/config";
import { db } from "../client";
import { testimonials } from "../schemas";
import { and, eq, ilike, inArray, sql } from "drizzle-orm";

class TestimonialQuery {
    async scan({
        ids,
        courseId,
        isActive,
    }: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
    } = {}) {
        const data = await db.query.testimonials.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(courseId ? [{ courseId }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
            with: { course: true },
        });

        return fullTestimonialSchema.array().parse(data);
    }

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        courseId,
        isActive,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
    }) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const data = await db.query.testimonials.findMany({
            where: {
                AND: [
                    ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
                    ...(courseId ? [{ courseId }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { position: "asc" },
            limit,
            offset: (page - 1) * limit,
            with: { course: true },
            extras: {
                count: db
                    .$count(
                        testimonials,
                        and(
                            search?.length
                                ? ilike(testimonials.name, `%${search}%`)
                                : undefined,
                            courseId
                                ? eq(testimonials.courseId, courseId)
                                : undefined,
                            isActive !== undefined
                                ? eq(testimonials.isActive, isActive)
                                : undefined
                        )
                    )
                    .as("testimonial_count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        const parsed = fullTestimonialSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id }: { id: string }) {
        const data = await db.query.testimonials.findFirst({
            where: { id },
            with: { course: true },
        });
        if (!data) return null;
        return fullTestimonialSchema.parse(data);
    }

    async create(values: CreateTestimonial[]) {
        const data = await db.transaction(async (tx) => {
            const rows = await tx
                .select({
                    max: sql<number>`coalesce(max(${testimonials.position}), -1)`,
                })
                .from(testimonials);

            const startAt = (rows[0]?.max ?? -1) + 1;
            const withPositions = values.map((value, index) => ({
                ...value,
                position: startAt + index,
            }));

            return tx.insert(testimonials).values(withPositions).returning();
        });

        return testimonialSchema.array().parse(data);
    }

    async update({ id, values }: { id: string; values: UpdateTestimonial }) {
        const data = await db
            .update(testimonials)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(testimonials.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async reorder({ values }: { values: ReorderTestimonial }) {
        if (values.length === 0) return [];

        const data = await db.transaction(async (tx) => {
            return Promise.all(
                values.map(({ id, position }) =>
                    tx
                        .update(testimonials)
                        .set({ position, updatedAt: new Date() })
                        .where(eq(testimonials.id, id))
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
        values: UpdateTestimonial;
    }) {
        const data = await db
            .update(testimonials)
            .set({ ...values, updatedAt: new Date() })
            .where(inArray(testimonials.id, ids))
            .returning();

        return testimonialSchema.array().parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(testimonials)
            .where(inArray(testimonials.id, ids))
            .returning();
        return data;
    }
}

export const testimonialQueries = new TestimonialQuery();
