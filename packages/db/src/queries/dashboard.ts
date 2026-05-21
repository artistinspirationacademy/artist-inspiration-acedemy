import {
    DashboardKpi,
    DashboardStats,
    dashboardStatsSchema,
} from "@workspace/config";
import { count, desc, eq, gte, sql } from "drizzle-orm";
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
                total: count(),
                last7d: count(
                    sql`case when ${createdAtCol} >= ${sevenDaysAgo} then 1 end`
                ),
                prev7d: count(
                    sql`case when ${createdAtCol} >= ${fourteenDaysAgo} and ${createdAtCol} < ${sevenDaysAgo} then 1 end`
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

    async getStats(): Promise<DashboardStats> {
        const now = new Date();
        const thirtyStart = startOfDayUTC(new Date(now.getTime() - 29 * DAY));

        const time = async <T>(label: string, p: Promise<T>): Promise<T> => {
            const t0 = Date.now();
            try {
                const r = await p;
                console.log(`[dashboard] ${label} ok in ${Date.now() - t0}ms`);
                return r;
            } catch (err) {
                console.error(
                    `[dashboard] ${label} FAILED in ${Date.now() - t0}ms`,
                    err
                );
                throw err;
            }
        };

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
            time("kpi:bookings", this.kpi(bookings, bookings.createdAt)),
            time(
                "kpi:activeBookings",
                this.kpi(
                    bookings,
                    bookings.createdAt,
                    eq(bookings.isActive, true)
                )
            ),
            time("kpi:courses", this.kpi(courses, courses.createdAt)),
            time("kpi:teachers", this.kpi(teachers, teachers.createdAt)),
            time(
                "kpi:testimonials",
                this.kpi(testimonials, testimonials.createdAt)
            ),
            time("kpi:media", this.kpi(media, media.createdAt)),
            time("kpi:users", this.kpi(users, users.createdAt)),
            time(
                "trend",
                db
                    .select({
                        day: sql<string>`to_char(date_trunc('day', ${bookings.createdAt}), 'YYYY-MM-DD')`,
                        count: sql<number>`count(*)::int`,
                    })
                    .from(bookings)
                    .where(gte(bookings.createdAt, thirtyStart))
                    .groupBy(sql`date_trunc('day', ${bookings.createdAt})`)
                    .orderBy(sql`date_trunc('day', ${bookings.createdAt})`)
            ),
            time(
                "byCourse",
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
                    .limit(5)
            ),
            time(
                "byCountry",
                db
                    .select({
                        country: bookings.country,
                        count: sql<number>`count(*)::int`,
                    })
                    .from(bookings)
                    .groupBy(bookings.country)
                    .orderBy(desc(sql<number>`count(*)`))
                    .limit(6)
            ),
            time(
                "byExperience",
                db
                    .select({
                        experienceLevel: bookings.experienceLevel,
                        count: sql<number>`count(*)::int`,
                    })
                    .from(bookings)
                    .groupBy(bookings.experienceLevel)
                    .orderBy(desc(sql<number>`count(*)`))
            ),
            time(
                "recentBookings",
                bookingQueries.paginate({
                    page: 1,
                    limit: 10,
                    include: "course",
                })
            ),
            time("configuration", configurationQueries.get()),
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
