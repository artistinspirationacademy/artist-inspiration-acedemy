"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
    columnCount?: number;
    pageSize?: number;
    filterCount?: number;
    showCreateButton?: boolean;
}

export function DataTableSkeleton({
    columnCount = 6,
    pageSize = 10,
    filterCount = 2,
    showCreateButton = false,
}: DataTableSkeletonProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Skeleton className="h-8 w-full max-w-[260px] rounded-md" />
                    {Array.from({ length: filterCount }).map((_, i) => (
                        <Skeleton
                            key={`filter-${i}`}
                            className="h-8 w-[120px] rounded-md"
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-[110px] rounded-md" />
                    <Skeleton className="h-8 w-[90px] rounded-md" />
                    {showCreateButton && (
                        <Skeleton className="h-8 w-[120px] rounded-md" />
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columnCount }).map((_, i) => (
                                <TableHead key={`head-${i}`}>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: pageSize }).map((_, rowIndex) => (
                            <TableRow key={`row-${rowIndex}`}>
                                {Array.from({ length: columnCount }).map(
                                    (_, cellIndex) => (
                                        <TableCell
                                            key={`cell-${rowIndex}-${cellIndex}`}
                                        >
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    )
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
                <Skeleton className="h-4 w-[180px]" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-[100px] rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                </div>
            </div>
        </div>
    );
}
