"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AttendanceSheetSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-9 w-64" />
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border">
                <Skeleton className="h-9 w-full rounded-none" />
                <div className="space-y-px pt-px">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="h-11 w-full rounded-none"
                        />
                    ))}
                    <Skeleton className="h-9 w-full rounded-none" />
                </div>
            </div>
        </div>
    );
}
