"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BannerFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-64" />
                    <div className="flex items-center gap-4 rounded-md border p-3">
                        <Skeleton className="aspect-video w-32 shrink-0 rounded-md" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-9 w-20 rounded-md" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-72" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>
            </div>
        </div>
    );
}
