"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ConfigurationFormSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-3 w-60" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-md border p-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
