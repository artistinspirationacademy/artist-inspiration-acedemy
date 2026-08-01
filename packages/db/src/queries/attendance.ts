import {
    AttendanceDay,
    attendanceDaySchema,
    AttendanceEditorRole,
    AttendanceMonth,
    attendanceMonthSchema,
    AttendanceSheet,
    AttendanceSheetRow,
    attendanceSheetRowSchema,
    AttendanceSummary,
    attendanceSummarySchema,
    AttendanceTotals,
    FacultyAttendanceSheet,
    facultyAttendanceSheetRowSchema,
    FacultyAttendanceSummary,
    facultyAttendanceSummarySchema,
    isMonthInEnrollmentWindow,
    MarkAttendance,
    monthStart,
    shiftMonthKey,
    UpdateAttendanceMonth,
    WEEKS_PER_MONTH,
} from "@workspace/config";
import { and, asc, eq, gte, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "../client";
import {
    attendanceDays,
    attendanceMonths,
    courses,
    studentEnrollments,
    students,
} from "../schemas";

function totalsOf(days: { status: string }[]): AttendanceTotals {
    return {
        present: days.filter((d) => d.status === "present").length,
        absent: days.filter((d) => d.status === "absent").length,
        rescheduled: days.filter((d) => d.status === "rescheduled").length,
        marked: days.length,
    };
}

class AttendanceQuery {
    /**
     * Creates the missing sheet rows for a month, carrying the previous
     * month's figures forward when there is one. Idempotent, so it is safe to
     * run on every sheet read. Omitting `teacherId` ensures every teacher's
     * month at once (the Master Table read path).
     */
    async ensureMonth({
        teacherId,
        month,
    }: {
        teacherId?: string;
        month: string;
    }): Promise<AttendanceMonth[]> {
        const monthDate = monthStart(month);

        const enrollments = await db.query.studentEnrollments.findMany({
            where: {
                ...(teacherId ? { teacherId } : {}),
                isActive: true,
                student: { isActive: true },
            },
        });

        const eligible = enrollments.filter((enrollment) =>
            isMonthInEnrollmentWindow({
                month,
                startMonth: enrollment.startMonth,
                totalMonths: enrollment.totalMonths,
            })
        );
        if (!eligible.length) return [];

        const enrollmentIds = eligible.map((enrollment) => enrollment.id);
        const existing = await db.query.attendanceMonths.findMany({
            where: { month: monthDate, enrollmentId: { in: enrollmentIds } },
        });

        const existingIds = new Set(existing.map((row) => row.enrollmentId));
        const missing = eligible.filter(
            (enrollment) => !existingIds.has(enrollment.id)
        );
        if (!missing.length) return [];

        const previous = await db.query.attendanceMonths.findMany({
            where: {
                enrollmentId: { in: missing.map((e) => e.id) },
                month: { lt: monthDate },
            },
            orderBy: { month: "desc" },
        });

        const carryForward = new Map<string, (typeof previous)[number]>();
        for (const row of previous)
            if (!carryForward.has(row.enrollmentId))
                carryForward.set(row.enrollmentId, row);

        const data = await db
            .insert(attendanceMonths)
            .values(
                missing.map((enrollment) => {
                    const prev = carryForward.get(enrollment.id);

                    return {
                        enrollmentId: enrollment.id,
                        month: monthDate,
                        academyFee: prev?.academyFee ?? enrollment.academyFee,
                        teacherFee: prev?.teacherFee ?? enrollment.teacherFee,
                        monthlyClasses:
                            prev?.monthlyClasses ??
                            (enrollment.monthlyClasses ||
                                enrollment.classesPerWeek * WEEKS_PER_MONTH),
                        totalMonths:
                            prev?.totalMonths ?? enrollment.totalMonths,
                        notes: prev?.notes ?? null,
                    };
                })
            )
            .onConflictDoNothing()
            .returning();

        return attendanceMonthSchema.array().parse(data);
    }

    async sheet(params: {
        teacherId: string;
        month: string;
        audience: "faculty";
        page?: number;
        limit?: number;
    }): Promise<FacultyAttendanceSheet>;

    async sheet(params: {
        teacherId: string;
        month: string;
        audience?: "admin";
        page?: number;
        limit?: number;
    }): Promise<AttendanceSheet>;

    async sheet({
        teacherId,
        month,
        audience = "admin",
        page = 1,
        limit = 50,
    }: {
        teacherId: string;
        month: string;
        audience?: "admin" | "faculty";
        page?: number;
        limit?: number;
    }): Promise<AttendanceSheet | FacultyAttendanceSheet> {
        // resolve the page of row ids (and total) in SQL so a large roster is
        // never hydrated whole; hydration below only touches this page
        const idRows = await db
            .select({
                id: attendanceMonths.id,
                count: sql<number>`count(*) over()::int`,
            })
            .from(attendanceMonths)
            .innerJoin(
                studentEnrollments,
                eq(studentEnrollments.id, attendanceMonths.enrollmentId)
            )
            .innerJoin(students, eq(students.id, studentEnrollments.studentId))
            .innerJoin(courses, eq(courses.id, studentEnrollments.courseId))
            .where(
                and(
                    eq(attendanceMonths.month, monthStart(month)),
                    eq(studentEnrollments.teacherId, teacherId)
                )
            )
            .orderBy(asc(students.name), asc(courses.title))
            .limit(limit)
            .offset((page - 1) * limit);

        const count = idRows[0]?.count ?? 0;
        const pages = Math.ceil(count / limit);
        const ids = idRows.map((row) => row.id);

        if (!ids.length)
            return { month, teacherId, rows: [], count, pages } as
                | AttendanceSheet
                | FacultyAttendanceSheet;

        const data = await db.query.attendanceMonths.findMany({
            where: { id: { in: ids } },
            with: {
                days: { orderBy: { date: "asc" } },
                enrollment: { with: { student: true, course: true } },
            },
        });

        // The faculty schema has no academy-fee field at all, so parsing with
        // it is what strips the value before it can leave the query layer.
        const rowSchema =
            audience === "faculty"
                ? facultyAttendanceSheetRowSchema
                : attendanceSheetRowSchema;

        const order = new Map(ids.map((id, index) => [id, index]));
        const rows = data
            .map(({ enrollment, days, ...row }) => {
                const { student, course, ...enrollmentValues } = enrollment;

                return rowSchema.parse({
                    ...row,
                    student,
                    course,
                    enrollment: enrollmentValues,
                    days,
                    totals: totalsOf(days),
                });
            })
            .sort((a, b) => order.get(a.id)! - order.get(b.id)!);

        return { month, teacherId, rows, count, pages } as
            | AttendanceSheet
            | FacultyAttendanceSheet;
    }

    async summary(params: {
        teacherId: string;
        month: string;
        audience: "faculty";
    }): Promise<FacultyAttendanceSummary>;

    async summary(params: {
        teacherId: string;
        month: string;
        audience?: "admin";
    }): Promise<AttendanceSummary>;

    /**
     * Aggregates in SQL — the sheet is paginated, so the summary can no
     * longer ride it. Days are collapsed to one row per sheet row before the
     * join (the same fan-out guard as `dashboard.teacherLoad`), and the
     * per-row clamp in `classesLeft` happens inside the sum.
     */
    async summary({
        teacherId,
        month,
        audience = "admin",
    }: {
        teacherId: string;
        month: string;
        audience?: "admin" | "faculty";
    }): Promise<AttendanceSummary | FacultyAttendanceSummary> {
        const dayTotals = db
            .select({
                attendanceMonthId: attendanceDays.attendanceMonthId,
                present:
                    sql<number>`(count(*) filter (where ${attendanceDays.status} = 'present'))::int`.as(
                        "present"
                    ),
                absent: sql<number>`(count(*) filter (where ${attendanceDays.status} = 'absent'))::int`.as(
                    "absent"
                ),
                rescheduled:
                    sql<number>`(count(*) filter (where ${attendanceDays.status} = 'rescheduled'))::int`.as(
                        "rescheduled"
                    ),
                marked: sql<number>`count(*)::int`.as("marked"),
            })
            .from(attendanceDays)
            .where(
                and(
                    gte(attendanceDays.date, monthStart(month)),
                    lt(attendanceDays.date, monthStart(shiftMonthKey(month, 1)))
                )
            )
            .groupBy(attendanceDays.attendanceMonthId)
            .as("day_totals");

        const [row] = await db
            .select({
                studentCount: sql<number>`count(distinct ${studentEnrollments.studentId})::int`,
                expectedClasses: sql<number>`coalesce(sum(${attendanceMonths.monthlyClasses}), 0)::int`,
                academyFeeTotal: sql<number>`coalesce(sum(${attendanceMonths.academyFee}), 0)::float`,
                teacherFeeTotal: sql<number>`coalesce(sum(${attendanceMonths.teacherFee}), 0)::float`,
                present: sql<number>`coalesce(sum(${dayTotals.present}), 0)::int`,
                absent: sql<number>`coalesce(sum(${dayTotals.absent}), 0)::int`,
                rescheduled: sql<number>`coalesce(sum(${dayTotals.rescheduled}), 0)::int`,
                marked: sql<number>`coalesce(sum(${dayTotals.marked}), 0)::int`,
                classesLeft: sql<number>`coalesce(sum(greatest(0, ${attendanceMonths.monthlyClasses} - coalesce(${dayTotals.present}, 0))), 0)::int`,
            })
            .from(attendanceMonths)
            .innerJoin(
                studentEnrollments,
                eq(studentEnrollments.id, attendanceMonths.enrollmentId)
            )
            .leftJoin(
                dayTotals,
                eq(dayTotals.attendanceMonthId, attendanceMonths.id)
            )
            .where(
                and(
                    eq(attendanceMonths.month, monthStart(month)),
                    eq(studentEnrollments.teacherId, teacherId)
                )
            );

        const summary = {
            month,
            studentCount: row?.studentCount ?? 0,
            totals: {
                present: row?.present ?? 0,
                absent: row?.absent ?? 0,
                rescheduled: row?.rescheduled ?? 0,
                marked: row?.marked ?? 0,
            },
            expectedClasses: row?.expectedClasses ?? 0,
            classesLeft: row?.classesLeft ?? 0,
            academyFeeTotal: row?.academyFeeTotal ?? 0,
            teacherFeeTotal: row?.teacherFeeTotal ?? 0,
        };

        return audience === "faculty"
            ? facultyAttendanceSummarySchema.parse(summary)
            : attendanceSummarySchema.parse(summary);
    }

    async scanMonths({ ids }: { ids: string[] }) {
        const data = await db.query.attendanceMonths.findMany({
            where: { id: { in: ids } },
            with: { enrollment: true },
        });

        return data.map(({ enrollment, ...row }) => ({
            ...attendanceMonthSchema.parse(row),
            teacherId: enrollment.teacherId,
        }));
    }

    async getMonth({ id }: { id: string }): Promise<AttendanceMonth | null> {
        const data = await db.query.attendanceMonths.findFirst({
            where: { id },
        });
        if (!data) return null;

        return attendanceMonthSchema.parse(data);
    }

    async updateMonth({
        id,
        values,
    }: {
        id: string;
        values: UpdateAttendanceMonth;
    }): Promise<AttendanceMonth | undefined> {
        const data = await db
            .update(attendanceMonths)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(attendanceMonths.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return attendanceMonthSchema.parse(data);
    }

    /**
     * Marks or clears cells in one round trip. A null status clears the cell,
     * and every write is keyed on (month, date) so concurrent editors cannot
     * overwrite each other's days.
     */
    async markDays({
        values,
        role,
        editorId,
    }: {
        values: MarkAttendance;
        role: AttendanceEditorRole;
        editorId: string;
    }): Promise<AttendanceDay[]> {
        const marks = values.filter((value) => value.status !== null);
        const clears = values.filter((value) => value.status === null);

        return db.transaction(async (tx) => {
            if (clears.length)
                await tx
                    .delete(attendanceDays)
                    .where(
                        or(
                            ...clears.map((value) =>
                                and(
                                    eq(
                                        attendanceDays.attendanceMonthId,
                                        value.attendanceMonthId
                                    ),
                                    eq(attendanceDays.date, value.date)
                                )
                            )
                        )
                    );

            if (!marks.length) return [];

            const data = await tx
                .insert(attendanceDays)
                .values(
                    marks.map((value) => ({
                        attendanceMonthId: value.attendanceMonthId,
                        date: value.date,
                        status: value.status!,
                        updatedByRole: role,
                        updatedById: editorId,
                    }))
                )
                .onConflictDoUpdate({
                    target: [
                        attendanceDays.attendanceMonthId,
                        attendanceDays.date,
                    ],
                    set: {
                        status: sql`excluded.status`,
                        updatedByRole: sql`excluded.updated_by_role`,
                        updatedById: sql`excluded.updated_by_id`,
                        updatedAt: new Date(),
                    },
                })
                .returning();

            return attendanceDaySchema.array().parse(data);
        });
    }

    async deleteMonths({ ids }: { ids: string[] }) {
        return db
            .delete(attendanceMonths)
            .where(inArray(attendanceMonths.id, ids))
            .returning();
    }
}

export const attendanceQueries = new AttendanceQuery();
