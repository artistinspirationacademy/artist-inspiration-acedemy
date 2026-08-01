"use client";

import { DashboardSkeleton } from "@/components/globals/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@workspace/rq";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { AttendanceSummaryCard } from "./attendance-summary-card";
import { BookingsByCountryChart } from "./bookings-by-country-chart";
import { BookingsByCourseChart } from "./bookings-by-course-chart";
import { BookingsByExperienceChart } from "./bookings-by-experience-chart";
import { BookingsTrendChart } from "./bookings-trend-chart";
import { KpiCard } from "./kpi-card";
import { PublicCountersCard } from "./public-counters-card";
import { RecentBookingsCard } from "./recent-bookings-card";
import { StudentsByCourseChart } from "./students-by-course-chart";
import { TeacherLoadCard } from "./teacher-load-card";

const TABS = ["academy", "website"] as const;

export function DashboardView() {
    const [tab, setTab] = useQueryState(
        "tab",
        parseAsStringLiteral(TABS).withDefault("academy")
    );

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
                    className="text-foreground text-xs hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as (typeof TABS)[number])}
            className="gap-4"
        >
            <TabsList>
                <TabsTrigger value="academy">Academy</TabsTrigger>
                <TabsTrigger value="website">Website</TabsTrigger>
            </TabsList>

            <TabsContent value="academy" className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    <KpiCard
                        label="Students"
                        icon="Student"
                        kpi={data.kpis.students}
                    />
                    <KpiCard
                        label="Active students"
                        icon="Check"
                        kpi={data.kpis.activeStudents}
                    />
                    <KpiCard
                        label="Enrolments"
                        icon="CalendarCheck"
                        kpi={data.kpis.enrollments}
                    />
                    <KpiCard
                        label="Teachers"
                        icon="Teacher"
                        kpi={data.kpis.teachers}
                    />
                    <KpiCard
                        label="Faculty logins"
                        icon="Key"
                        kpi={data.kpis.facultyAccounts}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <AttendanceSummaryCard data={data.attendance} />
                    <TeacherLoadCard data={data.teacherLoad} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StudentsByCourseChart data={data.studentsByCourse} />
                </div>
            </TabsContent>

            <TabsContent value="website" className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    <KpiCard
                        label="Bookings"
                        icon="Phone"
                        kpi={data.kpis.bookings}
                    />
                    <KpiCard
                        label="Active bookings"
                        icon="Check"
                        kpi={data.kpis.activeBookings}
                    />
                    <KpiCard
                        label="Courses"
                        icon="Book"
                        kpi={data.kpis.courses}
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
                    <BookingsByExperienceChart
                        data={data.bookingsByExperience}
                    />
                    <PublicCountersCard data={data.configuration} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <RecentBookingsCard data={data.recentBookings} />
                </div>
            </TabsContent>
        </Tabs>
    );
}
