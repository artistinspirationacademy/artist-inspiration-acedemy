"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SummarySkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[96px] w-full rounded-xl" />
                ))}
            </div>

            <Skeleton className="h-[240px] w-full rounded-xl" />
        </div>
    );
}
