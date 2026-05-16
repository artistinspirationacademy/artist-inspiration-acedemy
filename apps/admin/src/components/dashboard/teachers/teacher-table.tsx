"use client";
"use no memo";

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
    FullTeacher,
    generateUploadThingURL,
    Icons,
    truncateText,
} from "@workspace/config";
import { useTeacher } from "@workspace/rq";
import { format } from "date-fns";
import Image from "next/image";
import {
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    useQueryState,
} from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { ActiveFilter, CourseFilter } from "./filters";
import { TeacherAction } from "./teacher-action";

export type TableTeacher = FullTeacher & {
    imageUrl: string;
};

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<TableTeacher>[] => [
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md">
                    <Image
                        src={row.original.imageUrl}
                        alt={row.original.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
                <p>{truncateText(row.original.name, 30)}</p>
            </div>
        ),
    },
    {
        accessorKey: "courses",
        header: "Courses",
        cell: ({ row }) => {
            const courses = row.original.courses ?? [];
            if (!courses.length)
                return (
                    <span className="text-muted-foreground text-xs">
                        No courses
                    </span>
                );

            const visible = courses.slice(0, 2);
            const hidden = courses.length - visible.length;

            return (
                <div className="flex max-w-xs flex-wrap gap-1">
                    {visible.map((c) => (
                        <Badge
                            key={c.id}
                            variant="outline"
                            className="whitespace-nowrap"
                        >
                            {truncateText(c.title, 18)}
                        </Badge>
                    ))}
                    {hidden > 0 && (
                        <Badge
                            variant="secondary"
                            title={courses
                                .slice(2)
                                .map((c) => c.title)
                                .join(", ")}
                        >
                            +{hidden}
                        </Badge>
                    )}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "about",
        header: "About",
        cell: ({ row }) => (
            <p className="text-muted-foreground max-w-xs text-sm">
                {truncateText(row.original.about, 40)}
            </p>
        ),
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
            <Badge variant="secondary" className="whitespace-nowrap">
                {row.original.rating}
            </Badge>
        ),
    },
    {
        accessorKey: "experience",
        header: "Experience",
        cell: ({ row }) => (
            <span className="whitespace-nowrap">
                {row.original.experience} yrs
            </span>
        ),
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
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) =>
            format(new Date(row.original.updatedAt), "MMM dd, yyyy"),
        enableHiding: true,
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <TeacherAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<TableTeacher>[] = [
    { source: "id", target: "ID", include: true, order: 0 },
    { source: "name", target: "Name", include: true, order: 1 },
    {
        source: "courses",
        target: "Courses",
        include: true,
        order: 2,
        formatter: (data) =>
            (data.courses ?? []).map((c) => c.title).join(" | "),
    },
    { source: "about", target: "About", include: true, order: 3 },
    { source: "rating", target: "Rating", include: true, order: 4 },
    { source: "experience", target: "Experience", include: true, order: 5 },
    { source: "isActive", target: "Is Active", include: true, order: 6 },
    { source: "imageUrl", target: "Image URL", include: true, order: 7 },
    {
        source: "createdAt",
        target: "Created At",
        include: true,
        order: 8,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
    },
    {
        source: "updatedAt",
        target: "Modified At",
        include: true,
        order: 9,
        formatter: (data) => format(new Date(data.updatedAt), "yyyy-MM-dd"),
    },
];

export function TeacherTable() {
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit, setLimit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });
    const [courseId, setCourseId] = useQueryState("courseId", parseAsString);
    const [isActive, setIsActive] = useQueryState("isActive", parseAsBoolean);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<TableTeacher[]>([]);

    const { usePaginate, useDelete, useBulkUpdate } = useTeacher();

    const {
        data: dataRaw,
        isPending,
        refetch,
    } = usePaginate<{ data: FullTeacher[]; count: number; pages: number }>({
        limit,
        page,
        search,
        courseId: courseId ?? undefined,
        isActive: isActive ?? undefined,
        include: "courses",
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

    const handleExport = (_: string[], getSelected?: () => TableTeacher[]) => {
        const selected = getSelected ? getSelected() : [];
        setDataToExport(selected);
        setIsExportOpen(true);
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

    const data = useMemo(
        () => ({
            ...dataRaw,
            data: dataRaw?.data.map((d) => ({
                ...d,
                imageUrl: generateUploadThingURL(d.imageKey),
            })),
        }),
        [dataRaw]
    );

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
                    searchPlaceholder="Search by name..."
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
                                        title: "Activate selected teachers?",
                                        description:
                                            "Active teachers are visible on the public site.",
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
                                        title: "Deactivate selected teachers?",
                                        description:
                                            "Inactive teachers are hidden from the public site.",
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
                                        title: "Are you sure you want to delete the selected teachers?",
                                        description:
                                            "Deleting will permanently remove the selected teachers and all associated data. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        data.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as TableTeacher[]
                            }
                        />
                    }
                    filters={[
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

            <ExportDialog<TableTeacher>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`teachers_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}
