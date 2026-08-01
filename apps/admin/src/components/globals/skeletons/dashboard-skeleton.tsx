"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-[168px] rounded-lg" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-[96px] w-full rounded-xl" />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[360px] w-full rounded-xl md:col-span-2" />
                <Skeleton className="h-[360px] w-full rounded-xl md:col-span-2" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[280px] w-full rounded-xl md:col-span-2" />
            </div>
        </div>
    );
}
