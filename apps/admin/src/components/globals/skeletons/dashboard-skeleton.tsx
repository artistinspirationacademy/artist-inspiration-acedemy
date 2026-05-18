"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[280px] w-full rounded-xl" />
                <Skeleton className="h-[280px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
    );
}
