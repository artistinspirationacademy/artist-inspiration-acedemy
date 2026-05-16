"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Configuration } from "@workspace/config";
import Link from "next/link";

const ROWS: { key: keyof Configuration; label: string }[] = [
    { key: "learnerCount", label: "Learners" },
    { key: "teacherCount", label: "Mentors" },
    { key: "contentHoursCount", label: "Content hours" },
    { key: "countryCount", label: "Countries" },
];

export function PublicCountersCard({
    data,
}: {
    data: Configuration | null;
}) {
    return (
        <Card size="sm" className="col-span-1 md:col-span-2">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle>Public counters</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            Values shown on the public homepage
                        </p>
                    </div>
                    <Link
                        href="/configuration"
                        className="text-muted-foreground hover:text-foreground text-xs font-medium"
                    >
                        Edit →
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {ROWS.map((r) => (
                        <div
                            key={r.key}
                            className="bg-muted/40 rounded-md px-3 py-2"
                        >
                            <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                                {r.label}
                            </p>
                            <p className="font-heading text-xl font-semibold tabular-nums">
                                {(
                                    (data?.[r.key] as number | undefined) ?? 0
                                ).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                        Public bookings
                    </span>
                    <span
                        className={
                            data?.enableBooking
                                ? "text-emerald-500 font-medium"
                                : "text-red-500 font-medium"
                        }
                    >
                        {data?.enableBooking ? "Enabled" : "Disabled"}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
