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
    Course,
    CourseCategory,
    DEFAULT_PAGINATION,
    generateUploadThingURL,
    Icons,
    truncateText,
} from "@workspace/config";
import { useCourse, useCourseCategory } from "@workspace/rq";
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
import { CourseAction } from "./course-action";
import { ActiveFilter, CategoryFilter } from "./filters";

export type TableCourse = Course & {
    cardImageUrl: string;
    coverImageUrl: string;
    categoryName: string;
};

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<TableCourse>[] => [
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
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="bg-muted aspect-video w-16 shrink-0 overflow-hidden rounded-md">
                    <Image
                        src={row.original.cardImageUrl}
                        alt={row.original.title}
                        width={64}
                        height={36}
                        className="size-full object-cover"
                        unoptimized
                    />
                </div>
                <p>{truncateText(row.original.title, 30)}</p>
            </div>
        ),
    },
    {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="outline" className="whitespace-nowrap">
                {row.original.categoryName}
            </Badge>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <p className="text-muted-foreground max-w-xs text-sm">
                {truncateText(row.original.description, 40)}
            </p>
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
            <CourseAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<TableCourse>[] = [
    { source: "id", target: "ID", include: true, order: 0 },
    { source: "title", target: "Title", include: true, order: 1 },
    { source: "categoryName", target: "Category", include: true, order: 2 },
    { source: "description", target: "Description", include: true, order: 3 },
    { source: "isActive", target: "Is Active", include: true, order: 4 },
    {
        source: "cardImageUrl",
        target: "Card Image URL",
        include: true,
        order: 5,
    },
    {
        source: "coverImageUrl",
        target: "Cover Image URL",
        include: true,
        order: 6,
    },
    {
        source: "createdAt",
        target: "Created At",
        include: true,
        order: 7,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
    },
    {
        source: "updatedAt",
        target: "Modified At",
        include: true,
        order: 8,
        formatter: (data) => format(new Date(data.updatedAt), "yyyy-MM-dd"),
    },
];

export function CourseTable() {
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit, setLimit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });
    const [courseCategoryId, setCourseCategoryId] = useQueryState(
        "courseCategoryId",
        parseAsString
    );
    const [isActive, setIsActive] = useQueryState("isActive", parseAsBoolean);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<TableCourse[]>([]);

    const { usePaginate, useDelete, useBulkUpdate } = useCourse();
    const { useScan: useCategoryScan } = useCourseCategory();

    const { data: categories } = useCategoryScan({});
    const {
        data: dataRaw,
        isPending,
        refetch,
    } = usePaginate({
        limit,
        page,
        search,
        courseCategoryId: courseCategoryId ?? undefined,
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

    const handleExport = (_: string[], getSelected?: () => TableCourse[]) => {
        const selected = getSelected ? getSelected() : [];
        setDataToExport(selected);
        setIsExportOpen(true);
    };

    const handleCategoryChange = (newId: string | undefined) => {
        setCourseCategoryId(newId ?? null);
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

    const categoryMap = useMemo(() => {
        const map = new Map<string, CourseCategory>();
        categories?.forEach((c) => map.set(c.id, c));
        return map;
    }, [categories]);

    const data = useMemo(
        () => ({
            ...dataRaw,
            data: dataRaw?.data.map((d) => ({
                ...d,
                cardImageUrl: generateUploadThingURL(d.cardImageKey),
                coverImageUrl: generateUploadThingURL(d.coverImageKey),
                categoryName:
                    categoryMap.get(d.courseCategoryId)?.name ?? "Unknown",
            })),
        }),
        [dataRaw, categoryMap]
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
                    searchPlaceholder="Search by title..."
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
                                        title: "Activate selected courses?",
                                        description:
                                            "Active courses are visible on the public site.",
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
                                        title: "Deactivate selected courses?",
                                        description:
                                            "Inactive courses are hidden from the public site.",
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
                                        title: "Are you sure you want to delete the selected courses?",
                                        description:
                                            "Deleting will permanently remove the selected courses and all associated data. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        data.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as TableCourse[]
                            }
                        />
                    }
                    filters={[
                        <CategoryFilter
                            key="category-filter"
                            value={courseCategoryId}
                            onChange={handleCategoryChange}
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

            <ExportDialog<TableCourse>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`courses_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}
