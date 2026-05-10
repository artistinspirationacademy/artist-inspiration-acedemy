"use client";
"use no memo";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "./data-table";

interface ContentProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    isLoading?: boolean;
    pageSize?: number;
}

export function Content<TData, TValue>({
    columns,
    isLoading = false,
    pageSize = 10,
}: ContentProps<TData, TValue>) {
    const { table } = useDataTable<TData>();
    const rows = table.getRowModel().rows;

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        Array.from({ length: pageSize }).map((_, rowIndex) => (
                            <TableRow key={`skeleton-row-${rowIndex}`}>
                                {Array.from({ length: columns.length }).map(
                                    (_, cellIndex) => (
                                        <TableCell
                                            key={`skeleton-cell-${rowIndex}-${cellIndex}`}
                                        >
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    )
                                )}
                            </TableRow>
                        ))
                    ) : rows.length ? (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={
                                    row.getIsSelected() ? "selected" : undefined
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
