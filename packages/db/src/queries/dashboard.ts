import {
    DashboardKpi,
    DashboardStats,
    dashboardStatsSchema,
} from "@workspace/config";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../client";
import {
    bookings,
    courses,
    media,
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
                total: sql<number>`count(*)::int`,
                last7d: sql<number>`count(*) filter (where ${createdAtCol} >= ${sevenDaysAgo})::int`,
                prev7d: sql<number>`count(*) filter (where ${createdAtCol} >= ${fourteenDaysAgo} and ${createdAtCol} < ${sevenDaysAgo})::int`,
            })
            .from(table)
            .where(extraCondition);

        return {
            total: row?.total ?? 0,
            last7d: row?.last7d ?? 0,
            prev7d: row?.prev7d ?? 0,
        };
    }

    async getStats(): Promise<DashboardStats> {
        const now = new Date();
        const thirtyStart = startOfDayUTC(new Date(now.getTime() - 29 * DAY));

        const [
            bookingsKpi,
            activeBookingsKpi,
            coursesKpi,
            teachersKpi,
            testimonialsKpi,
            mediaKpi,
            usersKpi,
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

        const stats = {
            kpis: {
                bookings: bookingsKpi,
                activeBookings: activeBookingsKpi,
                courses: coursesKpi,
                teachers: teachersKpi,
                testimonials: testimonialsKpi,
                media: mediaKpi,
                users: usersKpi,
            },
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
