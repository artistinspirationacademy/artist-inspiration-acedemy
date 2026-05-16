import z from "zod";
import { configurationSchema } from "./configuration";
import { fullBookingSchema } from "./booking";

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

export const dashboardStatsSchema = z.object({
    kpis: z.object({
        bookings: dashboardKpiSchema,
        activeBookings: dashboardKpiSchema,
        courses: dashboardKpiSchema,
        teachers: dashboardKpiSchema,
        testimonials: dashboardKpiSchema,
        media: dashboardKpiSchema,
        users: dashboardKpiSchema,
    }),
    bookingsTrend: dashboardSeriesPointSchema.array(),
    bookingsByCourse: dashboardGroupCountSchema.array(),
    bookingsByCountry: dashboardGroupCountSchema.array(),
    bookingsByExperience: dashboardGroupCountSchema.array(),
    recentBookings: fullBookingSchema.array(),
    configuration: configurationSchema.nullable(),
    generatedAt: z.string(),
});

export type DashboardKpi = z.infer<typeof dashboardKpiSchema>;
export type DashboardSeriesPoint = z.infer<typeof dashboardSeriesPointSchema>;
export type DashboardGroupCount = z.infer<typeof dashboardGroupCountSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
