"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeatureFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="min-w-0 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-20" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-3 w-44" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="aspect-square w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
