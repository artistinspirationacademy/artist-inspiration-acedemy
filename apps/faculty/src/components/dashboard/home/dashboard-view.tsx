"use client";

import { SummarySkeleton } from "@/components/globals/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FacultyAttendanceSummary,
    formatFeeTag,
    formatMonthKey,
    monthKey,
} from "@workspace/config";
import { useAttendance, useFacultyAuth } from "@workspace/rq";
import Link from "next/link";
import { StatCard } from "./stat-card";

export function DashboardView() {
    const month = monthKey();

    const { useCurrentUser } = useFacultyAuth();
    const { data: user } = useCurrentUser();

    const { useSummary } = useAttendance();
    const { data, isPending } = useSummary<FacultyAttendanceSummary>({
        month,
    });

    if (isPending) return <SummarySkeleton />;
    if (!data) return null;

    const marked = data.totals.marked;
    const attendanceRate = marked
        ? Math.round((data.totals.present / marked) * 100)
        : 0;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    label="Students"
                    value={data.studentCount}
                    hint={`Enrolled with you in ${formatMonthKey(month)}`}
                    icon="Student"
                />
                <StatCard
                    label="Present"
                    value={data.totals.present}
                    hint={`${attendanceRate}% of ${marked} marked classes`}
                    icon="Check"
                    tone="positive"
                />
                <StatCard
                    label="Absent"
                    value={data.totals.absent}
                    hint={`${data.totals.rescheduled} marked for rescheduling`}
                    icon="Prohibit"
                    tone="negative"
                />
                <StatCard
                    label="Classes left"
                    value={data.classesLeft}
                    hint="Still to deliver this month"
                    icon="CalendarBlank"
                    tone="warning"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{formatMonthKey(month)} at a glance</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        {user
                            ? `Welcome back, ${user.teacher.name.split(" ")[0]}. `
                            : ""}
                        {marked
                            ? `${marked} of ${data.expectedClasses} expected classes are marked.`
                            : "No classes marked yet this month."}
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Figure
                            label="Expected classes"
                            value={String(data.expectedClasses)}
                        />
                        <Figure label="Marked" value={String(marked)} />
                        <Figure
                            label="Your fees this month"
                            value={formatFeeTag(data.teacherFeeTotal)}
                        />
                    </div>

                    <Button asChild>
                        <Link href="/attendance">Open attendance sheet</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function Figure({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border p-3">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-heading text-lg font-semibold tabular-nums">
                {value}
            </p>
        </div>
    );
}
