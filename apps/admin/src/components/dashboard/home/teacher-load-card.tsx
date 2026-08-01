"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, DashboardTeacherLoad, truncateText } from "@workspace/config";
import Link from "next/link";

export function TeacherLoadCard({ data }: { data: DashboardTeacherLoad[] }) {
    return (
        <Card size="sm" className="col-span-1 md:col-span-2">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle>Teacher load this month</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            Classes marked against those scheduled
                        </p>
                    </div>
                    <Link
                        href="/teachers"
                        className="text-muted-foreground hover:text-foreground text-xs font-medium whitespace-nowrap"
                    >
                        All teachers →
                    </Link>
                </div>
            </CardHeader>

            <CardContent>
                {data.length === 0 ? (
                    <div className="text-muted-foreground flex h-[180px] items-center justify-center text-sm">
                        No sheets for this month yet
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {data.map((teacher) => {
                            const pct =
                                teacher.expectedClasses > 0
                                    ? Math.min(
                                          teacher.marked /
                                              teacher.expectedClasses,
                                          1
                                      )
                                    : 0;

                            return (
                                <li key={teacher.key} className="space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p
                                            className="truncate text-sm font-medium"
                                            title={teacher.label}
                                        >
                                            {truncateText(teacher.label, 28)}
                                        </p>
                                        <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
                                            {teacher.marked} /{" "}
                                            {teacher.expectedClasses}
                                        </p>
                                    </div>

                                    <div
                                        role="meter"
                                        aria-label={`${teacher.label}: ${teacher.marked} of ${teacher.expectedClasses} classes marked`}
                                        aria-valuenow={Math.round(pct * 100)}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
                                    >
                                        <div
                                            className={cn(
                                                "bg-primary h-full rounded-full"
                                            )}
                                            style={{
                                                width: `${Math.round(pct * 100)}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="text-muted-foreground text-[11px]">
                                        {teacher.students}{" "}
                                        {teacher.students === 1
                                            ? "student"
                                            : "students"}
                                        {teacher.marked > 0 && (
                                            <>
                                                {" · "}
                                                {teacher.present} present ·{" "}
                                                {teacher.absent} absent
                                                {teacher.rescheduled > 0 &&
                                                    ` · ${teacher.rescheduled} to reschedule`}
                                            </>
                                        )}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
