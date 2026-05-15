import {
    BulkUpdateCourse,
    Course,
    CourseCategory,
    courseCategorySchema,
    courseSchema,
    CreateCourse,
    CreateCourseCategory,
    DEFAULT_PAGINATION,
    FullCourse,
    FullCourseCategory,
    fullCourseCategorySchema,
    fullCourseSchema,
    UpdateCourse,
    UpdateCourseCategory,
} from "@workspace/config";
import { and, eq, ilike, inArray } from "drizzle-orm";
import { db } from "../client";
import { courseCategories, courseDetails, courses } from "../schemas";

class CourseCategoryQuery {
    async scan(params: {
        ids?: string[];
        slugs?: string[];
        isActive?: boolean;
        include: "courses";
    }): Promise<FullCourseCategory[]>;

    async scan(params?: {
        ids?: string[];
        slugs?: string[];
        isActive?: boolean;
        include?: never;
    }): Promise<CourseCategory[]>;

    async scan({
        ids,
        slugs,
        isActive,
        include,
    }: {
        ids?: string[];
        slugs?: string[];
        isActive?: boolean;
        include?: "courses";
    } = {}): Promise<CourseCategory[] | FullCourseCategory[]> {
        const where = {
            AND: [
                ...(ids?.length ? [{ id: { in: ids } }] : []),
                ...(slugs?.length ? [{ slug: { in: slugs } }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        if (include === "courses") {
            const data = await db.query.courseCategories.findMany({
                where,
                orderBy: { name: "asc" },
                with: { courses: true },
            });
            return fullCourseCategorySchema.array().parse(data);
        }

        const data = await db.query.courseCategories.findMany({
            where,
            orderBy: { name: "asc" },
        });
        return courseCategorySchema.array().parse(data);
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
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const data = await db.query.courseCategories.findMany({
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
                        courseCategories,
                        and(
                            search?.length
                                ? ilike(courseCategories.name, `%${search}%`)
                                : undefined,
                            isActive !== undefined
                                ? eq(courseCategories.isActive, isActive)
                                : undefined
                        )
                    )
                    .as("category_count"),
            },
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);

        return { data: courseCategorySchema.array().parse(data), count, pages };
    }

    async get({
        id,
        slug,
    }: {
        id?: string;
        slug?: string;
    }): Promise<CourseCategory | null> {
        if (!id && !slug)
            throw new Error("Either 'id' or 'slug' must be provided");

        const data = await db.query.courseCategories.findFirst({
            where: {
                OR: [...(id ? [{ id }] : []), ...(slug ? [{ slug }] : [])],
            },
        });
        if (!data) return null;

        return courseCategorySchema.parse(data);
    }

    async create(values: CreateCourseCategory[]): Promise<CourseCategory[]> {
        const data = await db
            .insert(courseCategories)
            .values(values)
            .returning();

        return courseCategorySchema.array().parse(data);
    }

    async update({
        id,
        values,
    }: {
        id: string;
        values: UpdateCourseCategory;
    }): Promise<CourseCategory | undefined> {
        const data = await db
            .update(courseCategories)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(courseCategories.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return courseCategorySchema.parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db
            .delete(courseCategories)
            .where(inArray(courseCategories.id, ids))
            .returning();
    }
}

class CourseQuery {
    async scan(params: {
        ids?: string[];
        courseCategoryId?: string;
        isActive?: boolean;
        include: "details";
    }): Promise<FullCourse[]>;

    async scan(params?: {
        ids?: string[];
        courseCategoryId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<Course[]>;

    async scan({
        ids,
        courseCategoryId,
        isActive,
        include,
    }: {
        ids?: string[];
        courseCategoryId?: string;
        isActive?: boolean;
        include?: "details";
    } = {}): Promise<Course[] | FullCourse[]> {
        const where = {
            AND: [
                ...(ids?.length ? [{ id: { in: ids } }] : []),
                ...(courseCategoryId ? [{ courseCategoryId }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        if (include === "details") {
            const data = await db.query.courses.findMany({
                where,
                orderBy: { createdAt: "desc" },
                with: {
                    category: true,
                    details: { orderBy: { position: "asc" } },
                },
            });
            return fullCourseSchema.array().parse(data);
        }

        const data = await db.query.courses.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        return courseSchema.array().parse(data);
    }

    async paginate(params: {
        limit?: number;
        page?: number;
        search?: string;
        courseCategoryId?: string;
        isActive?: boolean;
        include: "details";
    }): Promise<{ data: FullCourse[]; count: number; pages: number }>;

    async paginate(params?: {
        limit?: number;
        page?: number;
        search?: string;
        courseCategoryId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<{ data: Course[]; count: number; pages: number }>;

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        courseCategoryId,
        isActive,
        include,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseCategoryId?: string;
        isActive?: boolean;
        include?: "details";
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const where = {
            AND: [
                ...(search ? [{ title: { ilike: `%${search}%` } }] : []),
                ...(courseCategoryId ? [{ courseCategoryId }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        const extras = {
            count: db
                .$count(
                    courses,
                    and(
                        search?.length
                            ? ilike(courses.title, `%${search}%`)
                            : undefined,
                        courseCategoryId
                            ? eq(courses.courseCategoryId, courseCategoryId)
                            : undefined,
                        isActive !== undefined
                            ? eq(courses.isActive, isActive)
                            : undefined
                    )
                )
                .as("course_count"),
        };

        if (include === "details") {
            const data = await db.query.courses.findMany({
                where,
                orderBy: { createdAt: "desc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: {
                    category: true,
                    details: { orderBy: { position: "asc" } },
                },
            });

            const count = +(data?.[0]?.count || 0);
            const pages = Math.ceil(count / limit);
            return { data: fullCourseSchema.array().parse(data), count, pages };
        }

        const data = await db.query.courses.findMany({
            where,
            orderBy: { createdAt: "desc" },
            limit,
            offset: (page - 1) * limit,
            extras,
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);
        return { data: courseSchema.array().parse(data), count, pages };
    }

    async get(params: {
        id: string;
        include: "details";
    }): Promise<FullCourse | null>;

    async get(params: { id: string; include?: never }): Promise<Course | null>;

    async get({
        id,
        include,
    }: {
        id: string;
        include?: "details";
    }): Promise<Course | FullCourse | null> {
        if (include === "details") {
            const data = await db.query.courses.findFirst({
                where: { id },
                with: {
                    category: true,
                    details: { orderBy: { position: "asc" } },
                },
            });
            if (!data) return null;
            return fullCourseSchema.parse(data);
        }

        const data = await db.query.courses.findFirst({ where: { id } });
        if (!data) return null;
        return courseSchema.parse(data);
    }

    async create(values: CreateCourse[]): Promise<FullCourse[]> {
        return db.transaction(async (tx) => {
            const results: FullCourse[] = [];

            for (const { details, ...courseValues } of values) {
                const course = await tx
                    .insert(courses)
                    .values(courseValues)
                    .returning()
                    .then((res) => res[0]!);

                const detailRows = details?.length
                    ? await tx
                          .insert(courseDetails)
                          .values(
                              details.map((d) => ({
                                  ...d,
                                  content: d.content as
                                      | string
                                      | { key: string; value: string }[],
                                  courseId: course.id,
                              }))
                          )
                          .returning()
                    : [];

                const category = await tx.query.courseCategories.findFirst({
                    where: { id: course.courseCategoryId },
                });

                results.push(
                    fullCourseSchema.parse({
                        ...course,
                        details: detailRows,
                        category,
                    })
                );
            }

            return results;
        });
    }

    async update(
        id: string,
        values: UpdateCourse
    ): Promise<FullCourse | undefined> {
        const { details, ...courseValues } = values;

        const data = await db.transaction(async (tx) => {
            const course = await tx
                .update(courses)
                .set({ ...courseValues, updatedAt: new Date() })
                .where(eq(courses.id, id))
                .returning()
                .then((res) => res[0]);

            if (!course) return undefined;

            if (details !== undefined) {
                await tx
                    .delete(courseDetails)
                    .where(eq(courseDetails.courseId, id));

                const detailRows = details.length
                    ? await tx
                          .insert(courseDetails)
                          .values(
                              details.map((d) => ({
                                  title: d.title,
                                  content: d.content as
                                      | string
                                      | { key: string; value: string }[],
                                  type: d.type,
                                  position: d.position,
                                  courseId: id,
                              }))
                          )
                          .returning()
                    : [];

                return { ...course, details: detailRows };
            }

            const existingDetails = await tx.query.courseDetails.findMany({
                where: { courseId: id },
                orderBy: { position: "asc" },
            });

            return { ...course, details: existingDetails };
        });

        if (!data) return undefined;

        const category = await db.query.courseCategories.findFirst({
            where: { id: data.courseCategoryId },
        });

        return fullCourseSchema.parse({ ...data, category });
    }

    async bulkUpdate({
        ids,
        values,
    }: {
        ids: string[];
        values: BulkUpdateCourse;
    }): Promise<Course[]> {
        const data = await db
            .update(courses)
            .set({ ...values, updatedAt: new Date() })
            .where(inArray(courses.id, ids))
            .returning();

        return courseSchema.array().parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db.transaction(async (tx) => {
            await tx
                .delete(courseDetails)
                .where(inArray(courseDetails.courseId, ids));

            return tx
                .delete(courses)
                .where(inArray(courses.id, ids))
                .returning();
        });
    }
}

export const courseCategoryQueries = new CourseCategoryQuery();
export const courseQueries = new CourseQuery();
