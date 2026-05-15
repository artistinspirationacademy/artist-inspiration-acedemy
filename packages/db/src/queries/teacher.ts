import {
    CreateTeacher,
    DEFAULT_PAGINATION,
    FullTeacher,
    fullTeacherSchema,
    Teacher,
    teacherSchema,
    UpdateTeacher,
} from "@workspace/config";
import { and, eq, ilike, inArray } from "drizzle-orm";
import { db } from "../client";
import { teachers } from "../schemas";

class TeacherQuery {
    async scan(params: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
        include: "course";
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
        include?: "course";
    } = {}): Promise<Teacher[] | FullTeacher[]> {
        const where = {
            AND: [
                ...(ids?.length ? [{ id: { in: ids } }] : []),
                ...(courseId ? [{ courseId }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        if (include === "course") {
            const data = await db.query.teachers.findMany({
                where,
                orderBy: { createdAt: "desc" },
                with: { course: true },
            });
            return fullTeacherSchema.array().parse(data);
        }

        const data = await db.query.teachers.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        return teacherSchema.array().parse(data);
    }

    async paginate(params: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include: "course";
    }): Promise<{ data: FullTeacher[]; count: number; pages: number }>;

    async paginate(params?: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<{ data: Teacher[]; count: number; pages: number }>;

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        courseId,
        isActive,
        include,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "course";
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const where = {
            AND: [
                ...(search ? [{ name: { ilike: `%${search}%` } }] : []),
                ...(courseId ? [{ courseId }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        const extras = {
            count: db
                .$count(
                    teachers,
                    and(
                        search?.length
                            ? ilike(teachers.name, `%${search}%`)
                            : undefined,
                        courseId ? eq(teachers.courseId, courseId) : undefined,
                        isActive !== undefined
                            ? eq(teachers.isActive, isActive)
                            : undefined
                    )
                )
                .as("teacher_count"),
        };

        if (include === "course") {
            const data = await db.query.teachers.findMany({
                where,
                orderBy: { createdAt: "desc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: { course: true },
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
            orderBy: { createdAt: "desc" },
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
        include: "course";
    }): Promise<FullTeacher | null>;

    async get(params: {
        id: string;
        include?: never;
    }): Promise<Teacher | null>;

    async get({
        id,
        include,
    }: {
        id: string;
        include?: "course";
    }): Promise<Teacher | FullTeacher | null> {
        if (include === "course") {
            const data = await db.query.teachers.findFirst({
                where: { id },
                with: { course: true },
            });
            if (!data) return null;
            return fullTeacherSchema.parse(data);
        }

        const data = await db.query.teachers.findFirst({ where: { id } });
        if (!data) return null;
        return teacherSchema.parse(data);
    }

    async create(values: CreateTeacher[]): Promise<Teacher[]> {
        const data = await db.insert(teachers).values(values).returning();
        return teacherSchema.array().parse(data);
    }

    async update({
        id,
        values,
    }: {
        id: string;
        values: UpdateTeacher;
    }): Promise<Teacher | undefined> {
        const data = await db
            .update(teachers)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(teachers.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return teacherSchema.parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db.delete(teachers).where(inArray(teachers.id, ids)).returning();
    }
}

export const teacherQueries = new TeacherQuery();
