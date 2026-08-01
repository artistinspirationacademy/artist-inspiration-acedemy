"use client";
"use no memo";

import { DataTableSkeleton } from "@/components/globals/skeletons";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableToolbar } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    DEFAULT_PAGINATION,
    displayStudentId,
    FacultyFullStudent,
    formatEnrollmentWindow,
    formatFeeTag,
    truncateText,
} from "@workspace/config";
import { useStudent } from "@workspace/rq";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo } from "react";

const columns: ColumnDef<FacultyFullStudent>[] = [
    {
        id: "studentId",
        header: "Student ID",
        cell: ({ row }) => (
            <span className="font-mono text-xs whitespace-nowrap">
                {displayStudentId(row.original)}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="min-w-0">
                <p>{truncateText(row.original.name, 30)}</p>
                {row.original.guardianName && (
                    <p className="text-muted-foreground text-xs">
                        Guardian: {row.original.guardianName}
                    </p>
                )}
            </div>
        ),
    },
    {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
            <div className="text-muted-foreground min-w-0 text-xs">
                {row.original.phone && <p>{row.original.phone}</p>}
                {row.original.email && <p>{row.original.email}</p>}
                {!row.original.phone && !row.original.email && <p>—</p>}
            </div>
        ),
        enableSorting: false,
    },
    {
        id: "courses",
        header: "Courses",
        cell: ({ row }) => (
            <div className="flex max-w-xs flex-wrap gap-1">
                {row.original.enrollments.map((enrollment) => (
                    <Badge
                        key={enrollment.id}
                        variant="secondary"
                        className="whitespace-nowrap"
                    >
                        {truncateText(enrollment.course.title, 18)}
                    </Badge>
                ))}
            </div>
        ),
        enableSorting: false,
    },
    {
        id: "terms",
        header: "Terms",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 whitespace-nowrap">
                {row.original.enrollments.map((enrollment) => (
                    <div key={enrollment.id}>
                        <p className="text-xs">
                            {formatFeeTag(enrollment.teacherFee)} ·{" "}
                            {enrollment.monthlyClasses} classes / month
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                            {formatEnrollmentWindow({
                                startMonth: enrollment.startMonth,
                                totalMonths: enrollment.totalMonths,
                            })}
                        </p>
                    </div>
                ))}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
            row.original.isActive ? (
                <Badge>Active</Badge>
            ) : (
                <Badge variant="secondary">Inactive</Badge>
            ),
    },
];

export function StudentTable() {
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit, setLimit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });

    const { usePaginate } = useStudent();
    const { data, isPending } = usePaginate<{
        data: FacultyFullStudent[];
        count: number;
        pages: number;
    }>({ limit, page, search, include: "enrollments" });

    const tableColumns = useMemo(() => columns, []);

    const handleSearchChange = (query: string) => {
        setSearch(query);
        setPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setLimit(newSize);
        setPage(1);
    };

    if (isPending)
        return (
            <DataTableSkeleton
                columnCount={tableColumns.length}
                pageSize={limit}
                filterCount={0}
            />
        );

    if (!data) return null;

    return (
        <DataTable.Root
            columns={tableColumns}
            data={data.data || []}
            pageCount={data.pages || 0}
            isLoading={isPending}
            pageSize={limit}
            manualPagination={true}
            state={{
                pagination: {
                    pageIndex: page,
                    pageSize: limit,
                },
            }}
            getRowId={(row) => row.id}
        >
            <DataTableToolbar
                searchPlaceholder="Search by name or ID..."
                searchValue={search}
                onSearchChange={handleSearchChange}
                searchDebounce={500}
            />

            <DataTable.Content
                columns={tableColumns}
                isLoading={isPending}
                pageSize={limit}
            />

            <DataTable.Pagination
                currentPage={page}
                pageCount={data.pages || 0}
                pageSize={limit}
                totalItems={data.count}
                isLoading={isPending}
                onPageChange={setPage}
                onRowsPerPageChange={handlePageSizeChange}
            />
        </DataTable.Root>
    );
}
