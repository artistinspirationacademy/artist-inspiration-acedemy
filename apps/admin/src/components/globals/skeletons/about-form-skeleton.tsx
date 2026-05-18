"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AboutFormSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-muted/30 space-y-4 rounded-xl border p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="size-6 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                    <Skeleton className="size-8 rounded-md" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ))}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Skeleton className="h-10 flex-1 rounded-md" />
                        <Skeleton className="h-10 w-28 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
