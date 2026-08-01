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
    Icons,
    Package,
    truncateText,
} from "@workspace/config";
import { usePackage } from "@workspace/rq";
import { format } from "date-fns";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { ActiveFilter } from "./filters";
import { PackageAction } from "./package-action";

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<Package>[] => [
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
            <p className="font-medium">{truncateText(row.original.name, 24)}</p>
        ),
    },
    {
        accessorKey: "totalClasses",
        header: "Total Classes",
        cell: ({ row }) => row.original.totalClasses,
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
            <PackageAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<Package>[] = [
    { source: "id", target: "ID", include: true, order: 0 },
    { source: "name", target: "Name", include: true, order: 1 },
    {
        source: "totalClasses",
        target: "Total Classes",
        include: true,
        order: 2,
    },
    { source: "isActive", target: "Is Active", include: true, order: 3 },
    {
        source: "createdAt",
        target: "Created At",
        include: true,
        order: 4,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
    },
    {
        source: "updatedAt",
        target: "Modified At",
        include: true,
        order: 5,
        formatter: (data) => format(new Date(data.updatedAt), "yyyy-MM-dd"),
    },
];

export function PackageTable() {
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit, setLimit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });
    const [isActive, setIsActive] = useQueryState("isActive", parseAsBoolean);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<Package[]>([]);

    const { usePaginate, useDelete, useBulkUpdate } = usePackage();
    const { data, isPending, refetch } = usePaginate({
        limit,
        page,
        search,
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

    const handleExport = (_: string[], getSelected?: () => Package[]) => {
        const selected = getSelected ? getSelected() : [];
        setDataToExport(selected);
        setIsExportOpen(true);
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
                filterCount={1}
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
                                        title: "Activate selected packages?",
                                        description:
                                            "Active packages are available for assignment.",
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
                                        title: "Deactivate selected packages?",
                                        description:
                                            "Inactive packages are hidden from assignment.",
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
                                        title: "Are you sure you want to delete the selected packages?",
                                        description:
                                            "Deleting will permanently remove the selected packages and all associated data. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        data.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as Package[]
                            }
                        />
                    }
                    filters={[
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

            <ExportDialog<Package>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`packages_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}
