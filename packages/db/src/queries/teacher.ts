import {
    CreateTeacher,
    DEFAULT_PAGINATION,
    FullTeacher,
    fullTeacherSchema,
    ReorderTeacher,
    Teacher,
    teacherSchema,
    TeacherWithAccount,
    teacherWithAccountSchema,
    UpdateTeacher,
} from "@workspace/config";
import { and, eq, exists, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../client";
import { toSafeFacultyUser } from "./faculty";
import { courseTeachers, teachers } from "../schemas";

function teacherFilters(params: {
    ids?: string[];
    courseId?: string;
    isActive?: boolean;
    search?: string;
}) {
    const { ids, courseId, isActive, search } = params;
    return {
        AND: [
            ...(ids?.length ? [{ id: { in: ids } }] : []),
            ...(isActive !== undefined ? [{ isActive }] : []),
            ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
            ...(courseId ? [{ courses: { id: courseId } }] : []),
        ],
    };
}

function countWhereClause(params: {
    courseId?: string;
    isActive?: boolean;
    search?: string;
}) {
    const { courseId, isActive, search } = params;
    return and(
        search?.length ? ilike(teachers.name, `%${search}%`) : undefined,
        isActive !== undefined ? eq(teachers.isActive, isActive) : undefined,
        courseId
            ? exists(
                  db
                      .select({ teacherId: courseTeachers.teacherId })
                      .from(courseTeachers)
                      .where(
                          and(
                              eq(courseTeachers.teacherId, teachers.id),
                              eq(courseTeachers.courseId, courseId)
                          )
                      )
              )
            : undefined
    );
}

class TeacherQuery {
    async scan(params: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
        include: "courses";
    }): Promise<FullTeacher[]>;

    async scan(params?: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<Teacher[]>;

    async scan({
        ids,
        courseId,
        isActive,
        include,
    }: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
        include?: "courses";
    } = {}): Promise<Teacher[] | FullTeacher[]> {
        const where = teacherFilters({ ids, courseId, isActive });

        if (include === "courses") {
            const data = await db.query.teachers.findMany({
                where,
                orderBy: { position: "asc" },
                with: { courses: true },
            });
            return fullTeacherSchema.array().parse(data);
        }

        const data = await db.query.teachers.findMany({
            where,
            orderBy: { position: "asc" },
        });
        return teacherSchema.array().parse(data);
    }

    async paginate(params: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include: "courses";
        withAccount: true;
    }): Promise<{ data: TeacherWithAccount[]; count: number; pages: number }>;

    async paginate(params: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include: "courses";
        withAccount?: never;
    }): Promise<{ data: FullTeacher[]; count: number; pages: number }>;

    async paginate(params?: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: never;
        withAccount?: never;
    }): Promise<{ data: Teacher[]; count: number; pages: number }>;

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        courseId,
        isActive,
        include,
        withAccount,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "courses";
        withAccount?: boolean;
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const where = teacherFilters({ courseId, isActive, search });

        const extras = {
            count: db
                .$count(teachers, countWhereClause({ courseId, isActive, search }))
                .as("teacher_count"),
        };

        if (include === "courses" && withAccount) {
            const data = await db.query.teachers.findMany({
                where,
                orderBy: { position: "asc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: { courses: true, account: true },
            });

            const count = +(data?.[0]?.count || 0);
            const pages = Math.ceil(count / limit);
            return {
                data: teacherWithAccountSchema.array().parse(
                    data.map((row) => ({
                        ...row,
                        account: row.account
                            ? toSafeFacultyUser(row.account)
                            : null,
                    }))
                ),
                count,
                pages,
            };
        }

        if (include === "courses") {
            const data = await db.query.teachers.findMany({
                where,
                orderBy: { position: "asc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: { courses: true },
            });

            const count = +(data?.[0]?.count || 0);
            const pages = Math.ceil(count / limit);
            return {
                data: fullTeacherSchema.array().parse(data),
                count,
                pages,
            };
        }

        const data = await db.query.teachers.findMany({
            where,
            orderBy: { position: "asc" },
            limit,
            offset: (page - 1) * limit,
            extras,
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);
        return { data: teacherSchema.array().parse(data), count, pages };
    }

    async get(params: {
        id: string;
        include: "courses";
        withAccount: true;
    }): Promise<TeacherWithAccount | null>;

    async get(params: {
        id: string;
        include: "courses";
        withAccount?: never;
    }): Promise<FullTeacher | null>;

    async get(params: {
        id: string;
        include?: never;
        withAccount?: never;
    }): Promise<Teacher | null>;

    async get({
        id,
        include,
        withAccount,
    }: {
        id: string;
        include?: "courses";
        withAccount?: boolean;
    }): Promise<Teacher | FullTeacher | TeacherWithAccount | null> {
        if (include === "courses" && withAccount) {
            const data = await db.query.teachers.findFirst({
                where: { id },
                with: { courses: true, account: true },
            });
            if (!data) return null;

            return teacherWithAccountSchema.parse({
                ...data,
                account: data.account ? toSafeFacultyUser(data.account) : null,
            });
        }

        if (include === "courses") {
            const data = await db.query.teachers.findFirst({
                where: { id },
                with: { courses: true },
            });
            if (!data) return null;
            return fullTeacherSchema.parse(data);
        }

        const data = await db.query.teachers.findFirst({ where: { id } });
        if (!data) return null;
        return teacherSchema.parse(data);
    }

    async create(values: CreateTeacher[]): Promise<Teacher[]> {
        return db.transaction(async (tx) => {
            const results: Teacher[] = [];

            const rows = await tx
                .select({
                    max: sql<number>`coalesce(max(${teachers.position}), -1)`,
                })
                .from(teachers);
            let nextPosition = (rows[0]?.max ?? -1) + 1;

            for (const { courseIds, ...teacherData } of values) {
                const inserted = await tx
                    .insert(teachers)
                    .values({ ...teacherData, position: nextPosition })
                    .returning()
                    .then((res) => res[0]);

                if (!inserted) continue;

                nextPosition += 1;

                if (courseIds.length) {
                    await tx.insert(courseTeachers).values(
                        courseIds.map((courseId) => ({
                            teacherId: inserted.id,
                            courseId,
                        }))
                    );
                }

                results.push(teacherSchema.parse(inserted));
            }

            return results;
        });
    }

    async update({
        id,
        values,
    }: {
        id: string;
        values: UpdateTeacher;
    }): Promise<Teacher | undefined> {
        const { courseIds, ...teacherValues } = values;

        return db.transaction(async (tx) => {
            const updated = await tx
                .update(teachers)
                .set({ ...teacherValues, updatedAt: new Date() })
                .where(eq(teachers.id, id))
                .returning()
                .then((res) => res[0]);

            if (!updated) return undefined;

            if (courseIds !== undefined) {
                await tx
                    .delete(courseTeachers)
                    .where(eq(courseTeachers.teacherId, id));

                if (courseIds.length) {
                    await tx.insert(courseTeachers).values(
                        courseIds.map((courseId) => ({
                            teacherId: id,
                            courseId,
                        }))
                    );
                }
            }

            return teacherSchema.parse(updated);
        });
    }

    async bulkUpdate({
        ids,
        values,
    }: {
        ids: string[];
        values: UpdateTeacher;
    }): Promise<Teacher[]> {
        const { courseIds, ...teacherValues } = values;

        return db.transaction(async (tx) => {
            const updated = Object.keys(teacherValues).length
                ? await tx
                      .update(teachers)
                      .set({ ...teacherValues, updatedAt: new Date() })
                      .where(inArray(teachers.id, ids))
                      .returning()
                : await tx.query.teachers.findMany({
                      where: { id: { in: ids } },
                  });

            if (courseIds !== undefined) {
                await tx
                    .delete(courseTeachers)
                    .where(inArray(courseTeachers.teacherId, ids));

                if (courseIds.length) {
                    const rows = ids.flatMap((teacherId) =>
                        courseIds.map((courseId) => ({ teacherId, courseId }))
                    );
                    await tx.insert(courseTeachers).values(rows);
                }
            }

            return teacherSchema.array().parse(updated);
        });
    }

    async reorder({ values }: { values: ReorderTeacher }): Promise<Teacher[]> {
        if (values.length === 0) return [];

        const data = await db.transaction(async (tx) => {
            return Promise.all(
                values.map(({ id, position }) =>
                    tx
                        .update(teachers)
                        .set({ position, updatedAt: new Date() })
                        .where(eq(teachers.id, id))
                        .returning()
                        .then((res) => res[0])
                )
            );
        });

        return teacherSchema.array().parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db.delete(teachers).where(inArray(teachers.id, ids)).returning();
    }
}

export const teacherQueries = new TeacherQuery();
