import {
    DashboardKpi,
    DashboardStats,
    dashboardStatsSchema,
    monthKey,
    monthStart,
    shiftMonthKey,
} from "@workspace/config";
import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../client";
import {
    attendanceDays,
    attendanceMonths,
    bookings,
    courses,
    facultyUsers,
    media,
    studentEnrollments,
    students,
    teachers,
    testimonials,
    users,
} from "../schemas";
import { bookingQueries } from "./booking";
import { configurationQueries } from "./configuration";

const DAY = 24 * 60 * 60 * 1000;

function startOfDayUTC(d: Date) {
    return new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
}

function isoDate(d: Date) {
    return d.toISOString().slice(0, 10);
}

class DashboardQuery {
    private async kpi(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        table: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAtCol: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extraCondition?: any
    ): Promise<DashboardKpi> {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * DAY);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY);

        const [row] = await db
            .select({
                total: count(),
                last7d: count(
                    sql`case when ${gte(createdAtCol, sevenDaysAgo)} then 1 end`
                ),
                prev7d: count(
                    sql`case when ${and(gte(createdAtCol, fourteenDaysAgo), lt(createdAtCol, sevenDaysAgo))} then 1 end`
                ),
            })
            .from(table)
            .where(extraCondition);

        return {
            total: Number(row?.total ?? 0),
            last7d: Number(row?.last7d ?? 0),
            prev7d: Number(row?.prev7d ?? 0),
        };
    }

    /**
     * Day-level status counts for a calendar month. Filtering on `date` rather
     * than joining through `attendance_months` lets this ride the
     * `attendance_days_date_idx` index alone.
     */
    private daysByStatus(month: string) {
        return db
            .select({
                status: attendanceDays.status,
                count: sql<number>`count(*)::int`,
            })
            .from(attendanceDays)
            .where(
                and(
                    gte(attendanceDays.date, monthStart(month)),
                    lt(attendanceDays.date, monthStart(shiftMonthKey(month, 1)))
                )
            )
            .groupBy(attendanceDays.status);
    }

    /**
     * Sheet-row-level roll-up for a month. Kept separate from
     * {@link daysByStatus} on purpose: joining month rows to their day rows
     * would repeat each month row once per marked day and multiply these sums.
     */
    private monthRollup(month: string) {
        return db
            .select({
                rowCount: sql<number>`count(*)::int`,
                studentCount: sql<number>`count(distinct ${studentEnrollments.studentId})::int`,
                teacherCount: sql<number>`count(distinct ${studentEnrollments.teacherId})::int`,
                expectedClasses: sql<number>`coalesce(sum(${attendanceMonths.monthlyClasses}), 0)::int`,
                academyFeeTotal: sql<number>`coalesce(sum(${attendanceMonths.academyFee}), 0)::float`,
                teacherFeeTotal: sql<number>`coalesce(sum(${attendanceMonths.teacherFee}), 0)::float`,
                lockedCount: sql<number>`(count(*) filter (where ${attendanceMonths.isLocked}))::int`,
            })
            .from(attendanceMonths)
            .innerJoin(
                studentEnrollments,
                eq(studentEnrollments.id, attendanceMonths.enrollmentId)
            )
            .where(eq(attendanceMonths.month, monthStart(month)));
    }

    /**
     * Per-teacher load for a month. Days are collapsed to one row per sheet row
     * in a subquery before the join, so the `monthly_classes` sum stays honest.
     */
    private teacherLoad(month: string) {
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

        return db
            .select({
                key: teachers.id,
                label: teachers.name,
                students: sql<number>`count(distinct ${studentEnrollments.studentId})::int`,
                expectedClasses: sql<number>`coalesce(sum(${attendanceMonths.monthlyClasses}), 0)::int`,
                present: sql<number>`coalesce(sum(${dayTotals.present}), 0)::int`,
                absent: sql<number>`coalesce(sum(${dayTotals.absent}), 0)::int`,
                rescheduled: sql<number>`coalesce(sum(${dayTotals.rescheduled}), 0)::int`,
                marked: sql<number>`coalesce(sum(${dayTotals.marked}), 0)::int`,
            })
            .from(attendanceMonths)
            .innerJoin(
                studentEnrollments,
                eq(studentEnrollments.id, attendanceMonths.enrollmentId)
            )
            .innerJoin(teachers, eq(teachers.id, studentEnrollments.teacherId))
            .leftJoin(
                dayTotals,
                eq(dayTotals.attendanceMonthId, attendanceMonths.id)
            )
            .where(eq(attendanceMonths.month, monthStart(month)))
            .groupBy(teachers.id, teachers.name)
            .orderBy(
                desc(sql`coalesce(sum(${attendanceMonths.monthlyClasses}), 0)`)
            )
            .limit(8);
    }

    async getStats(): Promise<DashboardStats> {
        const now = new Date();
        const thirtyStart = startOfDayUTC(new Date(now.getTime() - 29 * DAY));
        const month = monthKey(now);

        const [
            bookingsKpi,
            activeBookingsKpi,
            coursesKpi,
            teachersKpi,
            testimonialsKpi,
            mediaKpi,
            usersKpi,
            studentsKpi,
            activeStudentsKpi,
            enrollmentsKpi,
            facultyAccountsKpi,
            monthRollupRows,
            dayStatusRows,
            teacherLoadRows,
            studentsByCourseRows,
            trendRows,
            byCourseRows,
            byCountryRows,
            byExperienceRows,
            recentBookings,
            configuration,
        ] = await Promise.all([
            this.kpi(bookings, bookings.createdAt),
            this.kpi(bookings, bookings.createdAt, eq(bookings.isActive, true)),
            this.kpi(courses, courses.createdAt),
            this.kpi(teachers, teachers.createdAt),
            this.kpi(testimonials, testimonials.createdAt),
            this.kpi(media, media.createdAt),
            this.kpi(users, users.createdAt),
            this.kpi(students, students.createdAt),
            this.kpi(students, students.createdAt, eq(students.isActive, true)),
            this.kpi(
                studentEnrollments,
                studentEnrollments.createdAt,
                eq(studentEnrollments.isActive, true)
            ),
            this.kpi(
                facultyUsers,
                facultyUsers.createdAt,
                eq(facultyUsers.isActive, true)
            ),
            this.monthRollup(month),
            this.daysByStatus(month),
            this.teacherLoad(month),
            db
                .select({
                    courseId: studentEnrollments.courseId,
                    title: courses.title,
                    count: sql<number>`count(distinct ${studentEnrollments.studentId})::int`,
                })
                .from(studentEnrollments)
                .leftJoin(courses, eq(courses.id, studentEnrollments.courseId))
                .where(eq(studentEnrollments.isActive, true))
                .groupBy(studentEnrollments.courseId, courses.title)
                .orderBy(
                    desc(sql`count(distinct ${studentEnrollments.studentId})`)
                )
                .limit(6),
            db
                .select({
                    day: sql<string>`to_char(date_trunc('day', ${bookings.createdAt}), 'YYYY-MM-DD')`,
                    count: sql<number>`count(*)::int`,
                })
                .from(bookings)
                .where(gte(bookings.createdAt, thirtyStart))
                .groupBy(sql`date_trunc('day', ${bookings.createdAt})`)
                .orderBy(sql`date_trunc('day', ${bookings.createdAt})`),
            db
                .select({
                    courseId: bookings.courseId,
                    title: courses.title,
                    count: sql<number>`count(*)::int`,
                })
                .from(bookings)
                .leftJoin(courses, eq(courses.id, bookings.courseId))
                .groupBy(bookings.courseId, courses.title)
                .orderBy(desc(sql<number>`count(*)`))
                .limit(5),
            db
                .select({
                    country: bookings.country,
                    count: sql<number>`count(*)::int`,
                })
                .from(bookings)
                .groupBy(bookings.country)
                .orderBy(desc(sql<number>`count(*)`))
                .limit(6),
            db
                .select({
                    experienceLevel: bookings.experienceLevel,
                    count: sql<number>`count(*)::int`,
                })
                .from(bookings)
                .groupBy(bookings.experienceLevel)
                .orderBy(desc(sql<number>`count(*)`)),
            bookingQueries.paginate({
                page: 1,
                limit: 10,
                include: "course",
            }),
            configurationQueries.get(),
        ]);

        const trendMap = new Map(trendRows.map((r) => [r.day, r.count]));
        const bookingsTrend = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(thirtyStart.getTime() + i * DAY);
            const key = isoDate(d);
            return { date: key, count: trendMap.get(key) ?? 0 };
        });

        const statusCount = (status: string) =>
            dayStatusRows.find((row) => row.status === status)?.count ?? 0;

        const present = statusCount("present");
        const absent = statusCount("absent");
        const rescheduled = statusCount("rescheduled");
        const rollup = monthRollupRows[0];

        const stats = {
            kpis: {
                bookings: bookingsKpi,
                activeBookings: activeBookingsKpi,
                courses: coursesKpi,
                teachers: teachersKpi,
                testimonials: testimonialsKpi,
                media: mediaKpi,
                users: usersKpi,
                students: studentsKpi,
                activeStudents: activeStudentsKpi,
                enrollments: enrollmentsKpi,
                facultyAccounts: facultyAccountsKpi,
            },
            attendance: {
                month,
                studentCount: rollup?.studentCount ?? 0,
                teacherCount: rollup?.teacherCount ?? 0,
                rowCount: rollup?.rowCount ?? 0,
                expectedClasses: rollup?.expectedClasses ?? 0,
                classesLeft: Math.max(
                    0,
                    (rollup?.expectedClasses ?? 0) - present
                ),
                lockedCount: rollup?.lockedCount ?? 0,
                academyFeeTotal: rollup?.academyFeeTotal ?? 0,
                teacherFeeTotal: rollup?.teacherFeeTotal ?? 0,
                present,
                absent,
                rescheduled,
                marked: present + absent + rescheduled,
            },
            teacherLoad: teacherLoadRows,
            studentsByCourse: studentsByCourseRows.map((r) => ({
                key: r.courseId,
                label: r.title ?? "Unknown course",
                count: r.count,
            })),
            bookingsTrend,
            bookingsByCourse: byCourseRows.map((r) => ({
                key: r.courseId,
                label: r.title ?? "Unknown course",
                count: r.count,
            })),
            bookingsByCountry: byCountryRows.map((r) => ({
                key: r.country,
                label: r.country,
                count: r.count,
            })),
            bookingsByExperience: byExperienceRows.map((r) => ({
                key: r.experienceLevel,
                label: r.experienceLevel,
                count: r.count,
            })),
            recentBookings: recentBookings.data,
            configuration,
            generatedAt: new Date().toISOString(),
        };

        return dashboardStatsSchema.parse(stats);
    }
}

export const dashboardQueries = new DashboardQuery();
