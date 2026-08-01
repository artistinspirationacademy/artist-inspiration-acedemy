import z from "zod";
import { fullBookingSchema } from "./booking";
import { configurationSchema } from "./configuration";

export const dashboardKpiSchema = z.object({
    total: z.number().nonnegative(),
    last7d: z.number().nonnegative(),
    prev7d: z.number().nonnegative(),
});

export const dashboardSeriesPointSchema = z.object({
    date: z.string(),
    count: z.number().nonnegative(),
});

export const dashboardGroupCountSchema = z.object({
    key: z.string(),
    label: z.string(),
    count: z.number().nonnegative(),
});

/** Academy-wide roll-up of one month's attendance sheets, across every teacher. */
export const dashboardAttendanceSchema = z.object({
    month: z.string(),
    studentCount: z.number().nonnegative(),
    teacherCount: z.number().nonnegative(),
    rowCount: z.number().nonnegative(),
    expectedClasses: z.number().nonnegative(),
    classesLeft: z.number().nonnegative(),
    lockedCount: z.number().nonnegative(),
    academyFeeTotal: z.number().nonnegative(),
    teacherFeeTotal: z.number().nonnegative(),
    present: z.number().nonnegative(),
    absent: z.number().nonnegative(),
    rescheduled: z.number().nonnegative(),
    marked: z.number().nonnegative(),
});

export const dashboardTeacherLoadSchema = z.object({
    key: z.string(),
    label: z.string(),
    students: z.number().nonnegative(),
    expectedClasses: z.number().nonnegative(),
    present: z.number().nonnegative(),
    absent: z.number().nonnegative(),
    rescheduled: z.number().nonnegative(),
    marked: z.number().nonnegative(),
});

export const dashboardStatsSchema = z.object({
    kpis: z.object({
        bookings: dashboardKpiSchema,
        activeBookings: dashboardKpiSchema,
        courses: dashboardKpiSchema,
        teachers: dashboardKpiSchema,
        testimonials: dashboardKpiSchema,
        media: dashboardKpiSchema,
        users: dashboardKpiSchema,
        students: dashboardKpiSchema,
        activeStudents: dashboardKpiSchema,
        enrollments: dashboardKpiSchema,
        facultyAccounts: dashboardKpiSchema,
    }),
    bookingsTrend: dashboardSeriesPointSchema.array(),
    bookingsByCourse: dashboardGroupCountSchema.array(),
    bookingsByCountry: dashboardGroupCountSchema.array(),
    bookingsByExperience: dashboardGroupCountSchema.array(),
    recentBookings: fullBookingSchema.array(),
    attendance: dashboardAttendanceSchema,
    teacherLoad: dashboardTeacherLoadSchema.array(),
    studentsByCourse: dashboardGroupCountSchema.array(),
    configuration: configurationSchema.nullable(),
    generatedAt: z.string(),
});

export type DashboardKpi = z.infer<typeof dashboardKpiSchema>;
export type DashboardSeriesPoint = z.infer<typeof dashboardSeriesPointSchema>;
export type DashboardGroupCount = z.infer<typeof dashboardGroupCountSchema>;
export type DashboardAttendance = z.infer<typeof dashboardAttendanceSchema>;
export type DashboardTeacherLoad = z.infer<typeof dashboardTeacherLoadSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
