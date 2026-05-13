"use client";
"use no memo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DataTable,
    DataTableBulkActions,
    DataTableToolbar,
    ExportDialog,
    FieldMapping,
} from "@/components/ui/data-table";
import {
    DEFAULT_PAGINATION,
    FullBooking,
    Icons,
    truncateText,
} from "@workspace/config";
import {
    ColumnDef,
    ColumnFiltersState,
    getFilteredRowModel,
    getSortedRowModel,
    RowSelectionState,
    VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    useQueryState,
} from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ActiveFilter, CourseFilter } from "./filters";
import { BookingAction } from "./booking-action";
import { useBooking } from "@workspace/rq";

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<FullBooking>[] => [
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
            <p className="font-medium">{truncateText(row.original.name, 30)}</p>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <CopyableCell value={row.original.email} label="Email" />
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <CopyableCell value={row.original.phone} label="Phone" mono />
        ),
    },
    {
        accessorKey: "course.title",
        id: "courseTitle",
        header: "Course",
        cell: ({ row }) => (
            <Badge variant="outline" className="whitespace-nowrap">
                {truncateText(row.original.course.title, 24)}
            </Badge>
        ),
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
            row.original.isActive ? (
                <Badge>Completed</Badge>
            ) : (
                <Badge variant="secondary">Inactive</Badge>
            ),
    },
    {
        accessorKey: "createdAt",
        header: "Booked At",
        cell: ({ row }) =>
            format(new Date(row.original.createdAt), "MMM dd, yyyy"),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <BookingAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<FullBooking>[] = [
    { source: "id", target: "ID", include: true, order: 0 },
    { source: "name", target: "Name", include: true, order: 1 },
    { source: "email", target: "Email", include: true, order: 2 },
    { source: "phone", target: "Phone", include: true, order: 3 },
    { source: "age", target: "Age", include: true, order: 4 },
    { source: "gender", target: "Gender", include: true, order: 5 },
    { source: "country", target: "Country", include: true, order: 6 },
    {
        source: "experienceLevel",
        target: "Experience",
        include: true,
        order: 7,
    },
    {
        source: "course",
        target: "Course",
        include: true,
        order: 8,
        formatter: (data) => data.course.title,
    },
    {
        source: "timestamp",
        target: "Preferred Start",
        include: true,
        order: 9,
        formatter: (data) => format(new Date(data.timestamp), "yyyy-MM-dd"),
    },
    { source: "isActive", target: "Is Active", include: true, order: 10 },
    {
        source: "createdAt",
        target: "Booked At",
        include: true,
        order: 11,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
    },
    {
        source: "updatedAt",
        target: "Modified At",
        include: true,
        order: 12,
        formatter: (data) => format(new Date(data.updatedAt), "yyyy-MM-dd"),
    },
];

export function BookingTable() {
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
    const [dataToExport, setDataToExport] = useState<FullBooking[]>([]);

    const { usePaginate, useDelete } = useBooking();
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

    const handleDelete = async (selectedIds: string[]) => {
        await deleteAsync({ ids: selectedIds });
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

    const handleExport = (_: string[], getSelected?: () => FullBooking[]) => {
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

    const tableColumns = useMemo(
        () => columns(handleSingleDelete),
        [handleSingleDelete]
    );

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
                    searchPlaceholder="Search by name, email or phone..."
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                    searchDebounce={500}
                    bulkActions={
                        <DataTableBulkActions
                            actions={[
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
                                        title: "Are you sure you want to delete the selected bookings?",
                                        description:
                                            "Deleting will permanently remove the selected bookings and all associated data. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        dataRaw.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as FullBooking[]
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

            <ExportDialog<FullBooking>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`bookings_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}

function CopyableCell({
    value,
    label,
    mono,
}: {
    value: string;
    label: string;
    mono?: boolean;
}) {
    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Couldn't copy ${label.toLowerCase()}`);
        }
    };

    return (
        <div className="group flex items-center gap-1">
            <span
                className={
                    mono
                        ? "text-foreground font-mono text-sm"
                        : "text-foreground text-sm"
                }
            >
                {value}
            </span>
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleCopy}
                aria-label={`Copy ${label.toLowerCase()}`}
            >
                <Icons.Copy className="size-3" />
            </Button>
        </div>
    );
}
