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
    FullTestimonial,
    generateUploadThingURL,
    Icons,
    truncateText,
} from "@workspace/config";
import { useTestimonial } from "@workspace/rq";
import { format } from "date-fns";
import Image from "next/image";
import {
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    useQueryState,
} from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { DataTableSkeleton } from "@/components/globals/skeletons";
import { ActiveFilter, CourseFilter } from "./filters";
import { TestimonialAction } from "./testimonial-action";

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<FullTestimonial>[] => [
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
        cell: ({ row }) => {
            const avatar = row.original.avatarKey
                ? generateUploadThingURL(row.original.avatarKey)
                : null;
            return (
                <div className="flex items-center gap-2">
                    <div className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-full">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt={row.original.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="text-muted-foreground flex size-full items-center justify-center text-xs font-medium uppercase">
                                {row.original.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium">
                            {truncateText(row.original.name, 24)}
                        </p>
                        {row.original.country && (
                            <p className="text-muted-foreground truncate text-xs">
                                {row.original.country}
                            </p>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "feedback",
        header: "Feedback",
        cell: ({ row }) => (
            <p className="text-muted-foreground max-w-md text-sm">
                {truncateText(row.original.feedback, 40)}
            </p>
        ),
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Icons.Star
                        key={i}
                        weight={i < row.original.rating ? "fill" : "regular"}
                        className={
                            i < row.original.rating
                                ? "text-highlight size-3.5"
                                : "text-muted-foreground size-3.5"
                        }
                    />
                ))}
            </div>
        ),
    },
    {
        id: "courseTitle",
        accessorKey: "course.title",
        header: "Course",
        cell: ({ row }) =>
            row.original.course ? (
                <Badge variant="outline" className="whitespace-nowrap">
                    {truncateText(row.original.course.title, 22)}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            ),
    },
    {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => row.original.position,
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
            <TestimonialAction
                data={row.original}
                onDelete={handleSingleDelete}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<FullTestimonial>[] = [
    { source: "id", target: "ID", include: true, order: 0 },
    { source: "name", target: "Name", include: true, order: 1 },
    { source: "feedback", target: "Feedback", include: true, order: 2 },
    { source: "rating", target: "Rating", include: true, order: 3 },
    {
        source: "course",
        target: "Course",
        include: true,
        order: 4,
        formatter: (d) => d.course?.title ?? "",
    },
    { source: "country", target: "Country", include: true, order: 5 },
    { source: "position", target: "Position", include: true, order: 6 },
    { source: "isActive", target: "Is Active", include: true, order: 7 },
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

export function TestimonialTable() {
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
    const [dataToExport, setDataToExport] = useState<FullTestimonial[]>([]);

    const { usePaginate, useDelete, useBulkUpdate } = useTestimonial();
    const {
        data: dataRaw,
        isPending,
        refetch,
    } = usePaginate({
        limit,
        page,
        search,
        courseId: courseId ?? undefined,
        isActive: isActive ?? undefined,
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

    const handleExport = (
        _: string[],
        getSelected?: () => FullTestimonial[]
    ) => {
        const selected = getSelected ? getSelected() : [];
        setDataToExport(selected);
        setIsExportOpen(true);
    };

    const handleCourseChange = (newCourseId: string | undefined) => {
        setCourseId(newCourseId ?? null);
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

    const tableColumns = useMemo(
        () => columns(handleSingleDelete),
        [handleSingleDelete]
    );

    if (isPending) {
        return (
            <DataTableSkeleton
                columnCount={tableColumns.length}
                pageSize={limit}
                filterCount={2}
            />
        );
    }

    if (!dataRaw) return null;

    return (
        <>
            <DataTable.Root
                columns={tableColumns}
                data={dataRaw.data || []}
                pageCount={dataRaw.pages || 0}
                isLoading={isPending}
                pageSize={limit}
                manualPagination={true}
                enableRowSelection={true}
                state={{
                    pagination: { pageIndex: page, pageSize: limit },
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
                                        title: "Activate selected testimonials?",
                                        description:
                                            "Active testimonials are shown on the public site.",
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
                                        title: "Deactivate selected testimonials?",
                                        description:
                                            "Inactive testimonials are hidden from the public site.",
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
                                        title: "Are you sure you want to delete the selected testimonials?",
                                        description:
                                            "Deleting will permanently remove the selected testimonials. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        dataRaw.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as FullTestimonial[]
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
                    pageCount={dataRaw.pages || 0}
                    pageSize={limit}
                    totalItems={dataRaw.count}
                    isLoading={isPending}
                    onPageChange={setPage}
                    onRowsPerPageChange={handlePageSizeChange}
                />
            </DataTable.Root>

            <ExportDialog<FullTestimonial>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`testimonials_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}
