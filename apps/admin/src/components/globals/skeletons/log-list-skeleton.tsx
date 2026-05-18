"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LogListSkeletonProps {
    rowCount?: number;
    rowHeight?: string;
}

export function LogListSkeleton({
    rowCount = 8,
    rowHeight = "h-8",
}: LogListSkeletonProps) {
    return (
        <Card size="sm">
            <CardContent className="space-y-2 px-4 py-3">
                {Array.from({ length: rowCount }).map((_, i) => (
                    <Skeleton key={i} className={`${rowHeight} w-full`} />
                ))}
            </CardContent>
        </Card>
    );
}
