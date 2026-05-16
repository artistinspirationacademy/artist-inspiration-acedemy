"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullBooking, truncateText } from "@workspace/config";
import { format } from "date-fns";
import Link from "next/link";

export function RecentBookingsCard({ data }: { data: FullBooking[] }) {
    return (
        <Card size="sm" className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <CardTitle>Recent bookings</CardTitle>
                    <Link
                        href="/bookings"
                        className="text-muted-foreground hover:text-foreground text-xs font-medium"
                    >
                        View all →
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {data.length === 0 ? (
                    <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                        No bookings yet
                    </div>
                ) : (
                    <div className="divide-y">
                        {data.map((b) => (
                            <div
                                key={b.id}
                                className="hover:bg-muted/40 flex items-center justify-between gap-3 px-4 py-2.5 transition-colors"
                            >
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-medium">
                                            {b.name}
                                        </p>
                                        {b.isActive ? (
                                            <Badge className="h-4 text-[10px]">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="h-4 text-[10px]"
                                            >
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {truncateText(b.course.title, 30)} ·{" "}
                                        {b.country}
                                    </p>
                                </div>
                                <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
                                    {format(new Date(b.createdAt), "MMM d")}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
