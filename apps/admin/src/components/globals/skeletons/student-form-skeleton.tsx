"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4 rounded-md border p-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-10 w-full"
                                        />
                                    ))}
                                </div>
                                <Skeleton className="h-14 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-14 w-full rounded-md" />
                            <Skeleton className="h-14 w-full rounded-md" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
