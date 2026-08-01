import {
    AppError,
    CreatePackage,
    DEFAULT_PAGINATION,
    packageSchema,
    slugify,
    UpdatePackage,
} from "@workspace/config";
import { and, eq, ilike, inArray } from "drizzle-orm";
import { db } from "../client";
import { packages } from "../schemas";

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
            "A package with a similar name already exists",
            "CONFLICT"
        );
    throw err;
}

class PackageQuery {
    async scan({
        ids,
        isActive,
    }: {
        ids?: string[];
        isActive?: boolean;
    } = {}) {
        const data = await db.query.packages.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { name: "asc" },
        });

        return packageSchema.array().parse(data);
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

        const data = await db.query.packages.findMany({
            where: {
                AND: [
                    ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
                    ...(isActive !== undefined ? [{ isActive }] : []),
                ],
            },
            orderBy: { name: "asc" },
            limit,
            offset: (page - 1) * limit,
            extras: {
                count: db
                    .$count(
                        packages,
                        and(
                            search?.length
                                ? ilike(packages.name, `%${search}%`)
                                : undefined,
                            isActive !== undefined
                                ? eq(packages.isActive, isActive)
                                : undefined
                        )
                    )
                    .as("package_count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        const parsed = packageSchema.array().parse(data);
        return { data: parsed, count, pages };
    }

    async get({ id }: { id: string }) {
        const data = await db.query.packages.findFirst({ where: { id } });
        if (!data) return null;
        return packageSchema.parse(data);
    }

    async create(values: CreatePackage[]) {
        try {
            return await db
                .insert(packages)
                .values(values.map((value) => withSlug(value)))
                .returning();
        } catch (err) {
            translateSlugConflict(err);
        }
    }

    async update({ id, values }: { id: string; values: UpdatePackage }) {
        try {
            return await db
                .update(packages)
                .set({ ...withSlug(values), updatedAt: new Date() })
                .where(eq(packages.id, id))
                .returning()
                .then((res) => res[0]);
        } catch (err) {
            translateSlugConflict(err);
        }
    }

    async bulkUpdate({
        ids,
        values,
    }: {
        ids: string[];
        values: UpdatePackage;
    }) {
        try {
            const data = await db
                .update(packages)
                .set({ ...withSlug(values), updatedAt: new Date() })
                .where(inArray(packages.id, ids))
                .returning();

            return packageSchema.array().parse(data);
        } catch (err) {
            translateSlugConflict(err);
        }
    }

    async delete({ ids }: { ids: string[] }) {
        const data = await db
            .delete(packages)
            .where(inArray(packages.id, ids))
            .returning();
        return data;
    }
}

export const packageQueries = new PackageQuery();
