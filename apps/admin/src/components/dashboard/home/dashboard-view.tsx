"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@workspace/rq";
import { BookingsByCountryChart } from "./bookings-by-country-chart";
import { BookingsByCourseChart } from "./bookings-by-course-chart";
import { BookingsByExperienceChart } from "./bookings-by-experience-chart";
import { BookingsTrendChart } from "./bookings-trend-chart";
import { KpiCard } from "./kpi-card";
import { PublicCountersCard } from "./public-counters-card";
import { RecentBookingsCard } from "./recent-bookings-card";

export function DashboardView() {
    const { useStats } = useDashboard();
    const { data, isPending, isError, refetch } = useStats();

    if (isPending) return <DashboardSkeleton />;

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed p-10 text-center">
                <p className="text-muted-foreground text-sm">
                    Couldn’t load dashboard data
                </p>
                <button
                    onClick={() => refetch()}
                    className="text-foreground hover:underline text-xs"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <KpiCard
                    label="Bookings"
                    icon="Phone"
                    kpi={data.kpis.bookings}
                />
                <KpiCard
                    label="Active"
                    icon="Check"
                    kpi={data.kpis.activeBookings}
                />
                <KpiCard label="Courses" icon="Book" kpi={data.kpis.courses} />
                <KpiCard
                    label="Teachers"
                    icon="Teacher"
                    kpi={data.kpis.teachers}
                />
                <KpiCard
                    label="Testimonials"
                    icon="Star"
                    kpi={data.kpis.testimonials}
                />
                <KpiCard label="Media" icon="Image" kpi={data.kpis.media} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BookingsTrendChart data={data.bookingsTrend} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BookingsByCourseChart data={data.bookingsByCourse} />
                <BookingsByCountryChart data={data.bookingsByCountry} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BookingsByExperienceChart data={data.bookingsByExperience} />
                <PublicCountersCard data={data.configuration} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <RecentBookingsCard data={data.recentBookings} />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[96px] w-full rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-[280px] w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[280px] w-full rounded-xl md:col-span-2" />
                <Skeleton className="h-[280px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
    );
}
