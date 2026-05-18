"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
                    <Skeleton className="size-14 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-20 rounded-md" />
                        <Skeleton className="h-10 w-28 rounded-md" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32 rounded-md" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-36 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
