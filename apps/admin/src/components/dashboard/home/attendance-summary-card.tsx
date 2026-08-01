"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ATTENDANCE_STATUS_LABELS,
    cn,
    DashboardAttendance,
    formatFeeTag,
    formatMonthKey,
    Icons,
} from "@workspace/config";
import Link from "next/link";

/**
 * Marks carry identity, text stays in ink tokens. The light-mode steps are the
 * 600s rather than the 500s because emerald-500 (2.5:1) and amber-500 (2.2:1)
 * fall under the 3:1 floor for non-text marks on a white surface.
 */
const STATUS_MARKS = {
    present: "bg-emerald-600 dark:bg-emerald-500",
    absent: "bg-red-600 dark:bg-red-500",
    rescheduled: "bg-amber-600 dark:bg-amber-500",
} as const;

/** Attendance rate is a genuine good→bad scale, so the meter fill is severity. */
function rateSeverity(rate: number) {
    if (rate >= 0.9)
        return {
            fill: "bg-emerald-600 dark:bg-emerald-500",
            label: "On track",
        };
    if (rate >= 0.75)
        return { fill: "bg-amber-600 dark:bg-amber-500", label: "Slipping" };
    return { fill: "bg-red-600 dark:bg-red-500", label: "Needs attention" };
}

export function AttendanceSummaryCard({ data }: { data: DashboardAttendance }) {
    const rate = data.marked > 0 ? data.present / data.marked : null;
    const severity = rate === null ? null : rateSeverity(rate);
    const coverage =
        data.expectedClasses > 0
            ? Math.min(data.marked / data.expectedClasses, 1)
            : 0;

    const statuses = [
        { key: "present", value: data.present },
        { key: "absent", value: data.absent },
        { key: "rescheduled", value: data.rescheduled },
    ] as const;

    return (
        <Card size="sm" className="col-span-1 md:col-span-2">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle>Attendance</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            {formatMonthKey(data.month)} · {data.rowCount}{" "}
                            {data.rowCount === 1 ? "sheet row" : "sheet rows"}{" "}
                            across {data.teacherCount}{" "}
                            {data.teacherCount === 1 ? "teacher" : "teachers"}
                        </p>
                    </div>
                    <Link
                        href="/attendance"
                        className="text-muted-foreground hover:text-foreground text-xs font-medium whitespace-nowrap"
                    >
                        Open →
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {data.marked === 0 ? (
                    <div className="text-muted-foreground bg-muted/40 rounded-md px-3 py-6 text-center text-sm">
                        No classes marked yet this month
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                                Attendance rate
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                                {severity!.label}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <p className="font-heading text-3xl leading-none font-semibold">
                                {Math.round(rate! * 100)}%
                            </p>
                            <div className="flex-1 space-y-1">
                                <Meter
                                    value={rate!}
                                    fill={severity!.fill}
                                    label={`Attendance rate ${Math.round(rate! * 100)}%`}
                                />
                                <p className="text-muted-foreground text-[11px]">
                                    {data.present.toLocaleString()} present of{" "}
                                    {data.marked.toLocaleString()} marked
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                    {statuses.map((status) => (
                        <div
                            key={status.key}
                            className="bg-muted/40 space-y-1 rounded-md px-3 py-2"
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    aria-hidden
                                    className={cn(
                                        "size-2 shrink-0 rounded-full",
                                        STATUS_MARKS[status.key]
                                    )}
                                />
                                <p className="text-muted-foreground truncate text-[11px] font-medium">
                                    {ATTENDANCE_STATUS_LABELS[status.key].label}
                                </p>
                            </div>
                            <p className="font-heading text-xl font-semibold">
                                {status.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                            Month coverage
                        </p>
                        <p className="text-muted-foreground text-[11px] tabular-nums">
                            {data.marked.toLocaleString()} /{" "}
                            {data.expectedClasses.toLocaleString()} classes
                        </p>
                    </div>
                    <Meter
                        value={coverage}
                        fill="bg-primary"
                        label={`Month coverage ${Math.round(coverage * 100)}%`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 sm:grid-cols-3">
                    <Fact
                        label="Students"
                        value={data.studentCount.toLocaleString()}
                    />
                    <Fact
                        label="Classes left"
                        value={data.classesLeft.toLocaleString()}
                    />
                    <Fact
                        label="Locked rows"
                        value={data.lockedCount.toLocaleString()}
                    />
                    <Fact
                        label="Fees billed"
                        value={formatFeeTag(data.academyFeeTotal)}
                    />
                    <Fact
                        label="Teacher payout"
                        value={formatFeeTag(data.teacherFeeTotal)}
                    />
                    <Fact
                        label="Margin"
                        value={formatFeeTag(
                            data.academyFeeTotal - data.teacherFeeTotal
                        )}
                        warn={data.academyFeeTotal < data.teacherFeeTotal}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function Meter({
    value,
    fill,
    label,
}: {
    value: number;
    fill: string;
    label: string;
}) {
    const pct = Math.round(Math.max(0, Math.min(value, 1)) * 100);

    return (
        <div
            role="meter"
            aria-label={label}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="bg-muted h-2 w-full overflow-hidden rounded-full"
        >
            <div
                className={cn("h-full rounded-full transition-[width]", fill)}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function Fact({
    label,
    value,
    warn,
}: {
    label: string;
    value: string;
    warn?: boolean;
}) {
    return (
        <div className="space-y-0.5">
            <p className="text-muted-foreground text-[11px] font-medium">
                {label}
            </p>
            <p className="flex items-center gap-1 text-sm font-medium tabular-nums">
                {warn && (
                    <Icons.Warning className="size-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                )}
                {value}
            </p>
        </div>
    );
}
