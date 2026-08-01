"use client";
"use no memo";

import { DataTableSkeleton } from "@/components/globals/skeletons";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DataTable,
    DataTableBulkActions,
    DataTableToolbar,
    ExportDialog,
    FieldMapping,
} from "@/components/ui/data-table";
import {
    ColumnDef,
    ColumnFiltersState,
    getFilteredRowModel,
    getSortedRowModel,
    RowSelectionState,
    VisibilityState,
} from "@tanstack/react-table";
import {
    DEFAULT_PAGINATION,
    displayStudentId,
    formatEnrollmentWindow,
    formatFeeTag,
    FullStudent,
    Icons,
    truncateText,
} from "@workspace/config";
import { useStudent } from "@workspace/rq";
import { format } from "date-fns";
import {
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    useQueryState,
} from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { ActiveFilter, CourseFilter, TeacherFilter } from "./filters";
import { StudentAction } from "./student-action";

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<FullStudent>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
                {row.original.phone && (
                    <p className="text-muted-foreground text-xs">
                        {row.original.phone}
                    </p>
                )}
            </div>
        ),
    },
    {
        id: "teachers",
        header: "Teachers",
        cell: ({ row }) => {
            const teachers = [
                ...new Map(
                    row.original.enrollments.map((e) => [
                        e.teacher.id,
                        e.teacher,
                    ])
                ).values(),
            ];

            if (!teachers.length)
                return (
                    <span className="text-muted-foreground text-xs">
                        No teacher
                    </span>
                );

            return (
                <div className="flex max-w-xs flex-wrap gap-1">
                    {teachers.map((t) => (
                        <Badge
                            key={t.id}
                            variant="outline"
                            className="whitespace-nowrap"
                        >
                            {truncateText(t.name, 18)}
                        </Badge>
                    ))}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "courses",
        header: "Courses",
        cell: ({ row }) => {
            const courses = [
                ...new Map(
                    row.original.enrollments.map((e) => [e.course.id, e.course])
                ).values(),
            ];

            if (!courses.length)
                return (
                    <span className="text-muted-foreground text-xs">
                        No course
                    </span>
                );

            return (
                <div className="flex max-w-xs flex-wrap gap-1">
                    {courses.map((c) => (
                        <Badge
                            key={c.id}
                            variant="secondary"
                            className="whitespace-nowrap"
                        >
                            {truncateText(c.title, 18)}
                        </Badge>
                    ))}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "fee",
        header: "Academy Fee",
        cell: ({ row }) => {
            const total = row.original.enrollments.reduce(
                (acc, e) => acc + e.academyFee,
                0
            );

            return (
                <span className="whitespace-nowrap">{formatFeeTag(total)}</span>
            );
        },
        enableSorting: false,
    },
    {
        id: "schedule",
        header: "Schedule",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 whitespace-nowrap">
                {row.original.enrollments.map((e) => (
                    <div key={e.id}>
                        <p className="text-xs">
                            {e.monthlyClasses} classes / month
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                            {formatEnrollmentWindow({
                                startMonth: e.startMonth,
                                totalMonths: e.totalMonths,
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
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
            format(new Date(row.original.createdAt), "MMM dd, yyyy"),
        enableHiding: true,
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <StudentAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<FullStudent>[] = [
    {
        source: "code",
        target: "Student ID",
        include: true,
        order: 0,
        formatter: (data) => displayStudentId(data),
    },
    { source: "name", target: "Name", include: true, order: 1 },
    { source: "email", target: "Email", include: true, order: 2 },
    { source: "phone", target: "Phone", include: true, order: 3 },
    { source: "guardianName", target: "Guardian", include: true, order: 4 },
    {
        source: "enrollments",
        target: "Teachers",
        include: true,
        order: 5,
        formatter: (data) =>
            data.enrollments.map((e) => e.teacher.name).join(" | "),
    },
    {
        source: "enrollments",
        target: "Courses",
        include: true,
        order: 6,
        formatter: (data) =>
            data.enrollments.map((e) => e.course.title).join(" | "),
    },
    {
        source: "enrollments",
        target: "Academy Fee",
        include: true,
        order: 7,
        formatter: (data) =>
            String(data.enrollments.reduce((acc, e) => acc + e.academyFee, 0)),
    },
    {
        source: "enrollments",
        target: "Classes Per Month",
        include: true,
        order: 8,
        formatter: (data) =>
            data.enrollments.map((e) => e.monthlyClasses).join(" | "),
    },
    {
        source: "enrollments",
        target: "Duration",
        include: true,
        order: 9,
        formatter: (data) =>
            data.enrollments
                .map((e) =>
                    formatEnrollmentWindow({
                        startMonth: e.startMonth,
                        totalMonths: e.totalMonths,
                    })
                )
                .join(" | "),
    },
    { source: "isActive", target: "Is Active", include: true, order: 10 },
    {
        source: "createdAt",
        target: "Created At",
        include: true,
        order: 11,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
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
    const [teacherId, setTeacherId] = useQueryState("teacherId", parseAsString);
    const [courseId, setCourseId] = useQueryState("courseId", parseAsString);
    const [isActive, setIsActive] = useQueryState("isActive", parseAsBoolean);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<FullStudent[]>([]);

    const { usePaginate, useDelete, useBulkUpdate } = useStudent();

    const { data, isPending, refetch } = usePaginate<{
        data: FullStudent[];
        count: number;
        pages: number;
    }>({
        limit,
        page,
        search,
        teacherId: teacherId ?? undefined,
        courseId: courseId ?? undefined,
        isActive: isActive ?? undefined,
        include: "enrollments",
    });

    const { mutateAsync: deleteAsync, isPending: isDeleting } = useDelete();
    const { mutateAsync: bulkUpdateAsync, isPending: isBulkUpdating } =
        useBulkUpdate();

    const handleDelete = async (selectedIds: string[]) => {
        await deleteAsync({ ids: selectedIds });
        refetch();
        setRowSelection({});
    };

    const handleBulkActive = async (
        selectedIds: string[],
        isActive: boolean
    ) => {
        await bulkUpdateAsync({ ids: selectedIds, values: { isActive } });
        refetch();
        setRowSelection({});
    };

    const handleExport = (_: string[], getSelected?: () => FullStudent[]) => {
        const selected = getSelected ? getSelected() : [];
        setDataToExport(selected);
        setIsExportOpen(true);
    };

    const handleTeacherChange = (newId: string | undefined) => {
        setTeacherId(newId ?? null);
        setPage(1);
    };

    const handleCourseChange = (newId: string | undefined) => {
        setCourseId(newId ?? null);
        setPage(1);
    };

    const handleActiveChange = (value: boolean | undefined) => {
        setIsActive(value ?? null);
        setPage(1);
    };

    const handleSearchChange = (query: string) => {
        setSearch(query);
        setPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setLimit(newSize);
        setPage(1);
    };

    const handleSingleDelete = useCallback(
        (deletedId: string) => {
            setRowSelection((prev) => {
                const newSelection = { ...prev };
                delete newSelection[deletedId];
                return newSelection;
            });
            refetch();
        },
        [refetch]
    );

    const tableColumns = useMemo(
        () => columns(handleSingleDelete),
        [handleSingleDelete]
    );

    if (isPending) {
        return (
            <DataTableSkeleton
                columnCount={tableColumns.length}
                pageSize={limit}
                filterCount={3}
            />
        );
    }

    if (!data) return null;

    return (
        <>
            <DataTable.Root
                columns={tableColumns}
                data={data.data || []}
                pageCount={data.pages || 0}
                isLoading={isPending}
                pageSize={limit}
                manualPagination={true}
                enableRowSelection={true}
                state={{
                    pagination: {
                        pageIndex: page,
                        pageSize: limit,
                    },
                    rowSelection,
                    columnVisibility,
                    columnFilters,
                }}
                onRowSelectionChange={setRowSelection}
                getRowId={(row) => row.id}
                tableOptions={{
                    onColumnVisibilityChange: setColumnVisibility,
                    onColumnFiltersChange: setColumnFilters,
                    getSortedRowModel: getSortedRowModel(),
                    getFilteredRowModel: getFilteredRowModel(),
                }}
            >
                <DataTableToolbar
                    searchPlaceholder="Search by name or ID..."
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                    searchDebounce={500}
                    bulkActions={
                        <DataTableBulkActions
                            actions={[
                                {
                                    label: "Activate",
                                    icon: Icons.Eye,
                                    onClick: (selectedRowIds) =>
                                        handleBulkActive(selectedRowIds, true),
                                    disabled: isBulkUpdating,
                                    alert: {
                                        title: "Activate selected students?",
                                        description:
                                            "Active students appear on their teacher's attendance sheets.",
                                        confirm: "Activate",
                                    },
                                },
                                {
                                    label: "Deactivate",
                                    icon: Icons.EyeOff,
                                    onClick: (selectedRowIds) =>
                                        handleBulkActive(selectedRowIds, false),
                                    disabled: isBulkUpdating,
                                    alert: {
                                        title: "Deactivate selected students?",
                                        description:
                                            "Past sheets are kept, but they will not be added to new months.",
                                        confirm: "Deactivate",
                                    },
                                },
                                {
                                    label: "Export Selected",
                                    icon: Icons.Upload,
                                    onClick: handleExport,
                                },
                                {
                                    label: "Delete Selected",
                                    icon: Icons.Trash,
                                    onClick: (selectedRowIds) =>
                                        handleDelete(selectedRowIds),
                                    variant: "destructive",
                                    disabled: isDeleting,
                                    alert: {
                                        title: "Are you sure you want to delete the selected students?",
                                        description:
                                            "Deleting will permanently remove the selected students, their enrollments and every attendance record for them. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        data.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as FullStudent[]
                            }
                        />
                    }
                    filters={[
                        <TeacherFilter
                            key="teacher-filter"
                            value={teacherId}
                            onChange={handleTeacherChange}
                        />,
                        <CourseFilter
                            key="course-filter"
                            value={courseId}
                            onChange={handleCourseChange}
                        />,
                        <ActiveFilter
                            key="active-filter"
                            value={isActive}
                            onChange={handleActiveChange}
                        />,
                    ]}
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

            <ExportDialog<FullStudent>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`students_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}
