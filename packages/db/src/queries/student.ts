import {
    AppError,
    BulkUpdateStudent,
    CreateStudent,
    DEFAULT_PAGINATION,
    FullStudent,
    fullStudentSchema,
    monthStart,
    Student,
    StudentEnrollment,
    studentEnrollmentSchema,
    studentSchema,
    UpdateStudent,
    UpdateStudentEnrollment,
} from "@workspace/config";
import { and, eq, exists, ilike, inArray, or } from "drizzle-orm";
import { db } from "../client";
import { studentEnrollments, students } from "../schemas";

function studentFilters(params: {
    ids?: string[];
    teacherId?: string;
    courseId?: string;
    isActive?: boolean;
    search?: string;
}) {
    const { ids, teacherId, courseId, isActive, search } = params;
    return {
        AND: [
            ...(ids?.length ? [{ id: { in: ids } }] : []),
            ...(isActive !== undefined ? [{ isActive }] : []),
            ...(search
                ? [
                      {
                          OR: [
                              { name: { ilike: `%${search}%` } },
                              { code: { ilike: `%${search}%` } },
                          ],
                      },
                  ]
                : []),
            ...(teacherId || courseId
                ? [
                      {
                          enrollments: {
                              ...(teacherId ? { teacherId } : {}),
                              ...(courseId ? { courseId } : {}),
                          },
                      },
                  ]
                : []),
        ],
    };
}

function countWhereClause(params: {
    teacherId?: string;
    courseId?: string;
    isActive?: boolean;
    search?: string;
}) {
    const { teacherId, courseId, isActive, search } = params;
    return and(
        search?.length
            ? or(
                  ilike(students.name, `%${search}%`),
                  ilike(students.code, `%${search}%`)
              )
            : undefined,
        isActive !== undefined ? eq(students.isActive, isActive) : undefined,
        teacherId || courseId
            ? exists(
                  db
                      .select({ id: studentEnrollments.id })
                      .from(studentEnrollments)
                      .where(
                          and(
                              eq(studentEnrollments.studentId, students.id),
                              teacherId
                                  ? eq(studentEnrollments.teacherId, teacherId)
                                  : undefined,
                              courseId
                                  ? eq(studentEnrollments.courseId, courseId)
                                  : undefined
                          )
                      )
              )
            : undefined
    );
}

const enrollmentInclude = {
    enrollments: {
        with: { teacher: true, course: true },
        orderBy: { createdAt: "asc" },
    },
} as const;

class StudentQuery {
    async scan(params: {
        ids?: string[];
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include: "enrollments";
    }): Promise<FullStudent[]>;

    async scan(params?: {
        ids?: string[];
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<Student[]>;

    async scan({
        ids,
        teacherId,
        courseId,
        isActive,
        include,
    }: {
        ids?: string[];
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "enrollments";
    } = {}): Promise<Student[] | FullStudent[]> {
        const where = studentFilters({ ids, teacherId, courseId, isActive });

        if (include === "enrollments") {
            const data = await db.query.students.findMany({
                where,
                orderBy: { name: "asc" },
                with: enrollmentInclude,
            });
            return fullStudentSchema.array().parse(data);
        }

        const data = await db.query.students.findMany({
            where,
            orderBy: { name: "asc" },
        });
        return studentSchema.array().parse(data);
    }

    async paginate(params: {
        limit?: number;
        page?: number;
        search?: string;
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include: "enrollments";
    }): Promise<{ data: FullStudent[]; count: number; pages: number }>;

    async paginate(params?: {
        limit?: number;
        page?: number;
        search?: string;
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<{ data: Student[]; count: number; pages: number }>;

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        teacherId,
        courseId,
        isActive,
        include,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "enrollments";
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const where = studentFilters({
            teacherId,
            courseId,
            isActive,
            search,
        });

        const extras = {
            count: db
                .$count(
                    students,
                    countWhereClause({
                        teacherId,
                        courseId,
                        isActive,
                        search,
                    })
                )
                .as("student_count"),
        };

        if (include === "enrollments") {
            const data = await db.query.students.findMany({
                where,
                orderBy: { name: "asc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: enrollmentInclude,
            });

            const count = +(data?.[0]?.count || 0);
            const pages = Math.ceil(count / limit);
            return {
                data: fullStudentSchema.array().parse(data),
                count,
                pages,
            };
        }

        const data = await db.query.students.findMany({
            where,
            orderBy: { name: "asc" },
            limit,
            offset: (page - 1) * limit,
            extras,
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);
        return { data: studentSchema.array().parse(data), count, pages };
    }

    async get(params: {
        id: string;
        include: "enrollments";
    }): Promise<FullStudent | null>;

    async get(params: { id: string; include?: never }): Promise<Student | null>;

    async get({
        id,
        include,
    }: {
        id: string;
        include?: "enrollments";
    }): Promise<Student | FullStudent | null> {
        if (include === "enrollments") {
            const data = await db.query.students.findFirst({
                where: { id },
                with: enrollmentInclude,
            });
            if (!data) return null;
            return fullStudentSchema.parse(data);
        }

        const data = await db.query.students.findFirst({ where: { id } });
        if (!data) return null;
        return studentSchema.parse(data);
    }

    async getByCode({ code }: { code: string }): Promise<Student | null> {
        const data = await db.query.students.findFirst({ where: { code } });
        if (!data) return null;
        return studentSchema.parse(data);
    }

    async create(values: CreateStudent[]): Promise<Student[]> {
        return db.transaction(async (tx) => {
            const results: Student[] = [];

            for (const { enrollments, ...studentValues } of values) {
                const student = await tx
                    .insert(students)
                    .values(studentValues)
                    .returning()
                    .then((res) => res[0]);

                if (!student) continue;

                if (enrollments.length)
                    await tx.insert(studentEnrollments).values(
                        enrollments.map((enrollment) => ({
                            ...enrollment,
                            startMonth: monthStart(enrollment.startMonth),
                            studentId: student.id,
                        }))
                    );

                results.push(studentSchema.parse(student));
            }

            return results;
        });
    }

    /**
     * Enrollments are reconciled by their (teacher, course) pair rather than
     * replaced wholesale, so editing a student never discards the attendance
     * history hanging off an existing enrollment.
     */
    async update({
        id,
        values,
    }: {
        id: string;
        values: UpdateStudent;
    }): Promise<Student | undefined> {
        const { enrollments, ...studentValues } = values;

        return db.transaction(async (tx) => {
            const student = Object.keys(studentValues).length
                ? await tx
                      .update(students)
                      .set({ ...studentValues, updatedAt: new Date() })
                      .where(eq(students.id, id))
                      .returning()
                      .then((res) => res[0])
                : await tx.query.students.findFirst({ where: { id } });

            if (!student) return undefined;

            if (enrollments !== undefined) {
                const existing = await tx.query.studentEnrollments.findMany({
                    where: { studentId: id },
                });

                const keyOf = (row: { teacherId: string; courseId: string }) =>
                    `${row.teacherId}:${row.courseId}`;
                const incoming = new Map(
                    enrollments.map((enrollment) => [
                        keyOf(enrollment),
                        enrollment,
                    ])
                );

                const staleIds = existing
                    .filter((row) => !incoming.has(keyOf(row)))
                    .map((row) => row.id);

                if (staleIds.length)
                    await tx
                        .delete(studentEnrollments)
                        .where(inArray(studentEnrollments.id, staleIds));

                for (const [key, enrollment] of incoming) {
                    const match = existing.find((row) => keyOf(row) === key);
                    const payload = {
                        ...enrollment,
                        startMonth: monthStart(enrollment.startMonth),
                    };

                    if (match)
                        await tx
                            .update(studentEnrollments)
                            .set({ ...payload, updatedAt: new Date() })
                            .where(eq(studentEnrollments.id, match.id));
                    else
                        await tx
                            .insert(studentEnrollments)
                            .values({ ...payload, studentId: id });
                }
            }

            return studentSchema.parse(student);
        });
    }

    async getEnrollment({
        id,
    }: {
        id: string;
    }): Promise<StudentEnrollment | null> {
        const data = await db.query.studentEnrollments.findFirst({
            where: { id },
        });
        if (!data) return null;
        return studentEnrollmentSchema.parse(data);
    }

    /**
     * Direct enrollment edit for the Master Table. Re-assigning the tutor or
     * course can collide with the (student, teacher, course) unique index —
     * surfaced as a domain error rather than a raw Postgres violation.
     */
    async updateEnrollment({
        id,
        values,
    }: {
        id: string;
        values: UpdateStudentEnrollment;
    }): Promise<StudentEnrollment | undefined> {
        const { startMonth, ...rest } = values;

        try {
            const data = await db
                .update(studentEnrollments)
                .set({
                    ...rest,
                    ...(startMonth
                        ? { startMonth: monthStart(startMonth) }
                        : {}),
                    updatedAt: new Date(),
                })
                .where(eq(studentEnrollments.id, id))
                .returning()
                .then((res) => res[0]);

            if (!data) return undefined;
            return studentEnrollmentSchema.parse(data);
        } catch (err) {
            if ((err as { code?: string })?.code === "23505")
                throw new AppError(
                    "This student is already enrolled with that teacher for that course",
                    "CONFLICT"
                );
            throw err;
        }
    }

    async bulkUpdate({
        ids,
        values,
    }: {
        ids: string[];
        values: BulkUpdateStudent;
    }): Promise<Student[]> {
        const data = await db
            .update(students)
            .set({ ...values, updatedAt: new Date() })
            .where(inArray(students.id, ids))
            .returning();

        return studentSchema.array().parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db.delete(students).where(inArray(students.id, ids)).returning();
    }
}

export const studentQueries = new StudentQuery();
