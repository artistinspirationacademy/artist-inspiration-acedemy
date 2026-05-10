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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DEFAULT_PAGINATION,
    formatFileSize,
    generateUploadThingURL,
    Icons,
    Media,
    MEDIA_TYPES,
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
import Image from "next/image";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { TypeFilter } from "./filters";
import { MediaAction } from "./media-action";
import { useMedia } from "@workspace/rq";

export type TableMedia = Media & {
    url: string;
};

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<TableMedia>[] => [
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
            const data = row.original;
            return <MediaImage media={data} />;
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const data = row.original;
            const fileType = data.name.split(".").pop();
            if (!fileType) return "unknown";

            return (
                <Badge className="whitespace-nowrap uppercase">
                    {fileType}
                </Badge>
            );
        },
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => {
            const data = row.original;
            return (
                <span className="whitespace-nowrap">
                    {formatFileSize(data.size)}
                </span>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Uploaded At",
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
            <MediaAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<TableMedia>[] = [
    {
        source: "id",
        target: "ID",
        include: true,
        order: 0,
    },
    {
        source: "name",
        target: "File Name",
        include: true,
        order: 1,
    },
    {
        source: "type",
        target: "MIME Type",
        include: true,
        order: 2,
    },
    {
        source: "size",
        target: "Size (Bytes)",
        include: true,
        order: 3,
    },
    {
        source: "url",
        target: "URL",
        include: true,
        order: 4,
    },
    {
        source: "createdAt",
        target: "Uploaded At",
        include: true,
        order: 5,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
    },
    {
        source: "updatedAt",
        target: "Modified At",
        include: true,
        order: 6,
        formatter: (data) => format(new Date(data.updatedAt), "yyyy-MM-dd"),
    },
];

export function MediaTable() {
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit, setLimit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });
    const [type, setType] = useQueryState(
        "type",
        parseAsStringLiteral(MEDIA_TYPES)
    );

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<TableMedia[]>([]);

    const { usePaginate, useDelete } = useMedia();
    const {
        data: dataRaw,
        isPending,
        refetch,
    } = usePaginate({
        limit,
        page,
        search,
        type: type ?? undefined,
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

    const handleExport = (_: string[], getSelected?: () => TableMedia[]) => {
        const selectedProducts = getSelected ? getSelected() : [];
        setDataToExport(selectedProducts);
        setIsExportOpen(true);
    };

    const handleTypeChange = (
        newType: (typeof MEDIA_TYPES)[number] | undefined
    ) => {
        setType(newType ?? null);
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

    const data = useMemo(
        () => ({
            ...dataRaw,
            data: dataRaw?.data.map((d) => ({
                ...d,
                url: generateUploadThingURL(d.key),
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
                                        title: "Are you sure you want to delete the selected media?",
                                        description:
                                            "Deleting will permanently remove the selected media and all associated data. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        data.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as TableMedia[]
                            }
                        />
                    }
                    filters={[
                        <TypeFilter
                            key="type-filter"
                            value={type}
                            onChange={handleTypeChange}
                            title="Type"
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

            <ExportDialog<TableMedia>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`media_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}

function getFileIcon(mimeType: string) {
    if (mimeType.includes("audio"))
        return <Icons.FileAudio className="size-5" />;
    if (mimeType.includes("video"))
        return <Icons.FileVideo className="size-5" />;
    if (mimeType.includes("pdf")) return <Icons.FilePdf className="size-5" />;

    if (
        mimeType.includes("document") ||
        mimeType.includes("word") ||
        mimeType.includes("presentation") ||
        mimeType.includes("powerpoint") ||
        mimeType.includes("spreadsheet") ||
        mimeType.includes("excel")
    )
        return <Icons.FileText className="size-5" />;

    return <Icons.File className="size-5" />;
}

function MediaImage({ media }: { media: Media }) {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    const fileName = media.name.split(".").slice(0, -1).join(".");
    if (!fileName) return "unnamed";

    const mediaUrl = generateUploadThingURL(media.key);

    return (
        <>
            <div
                className="flex items-center gap-2 hover:cursor-pointer hover:underline"
                onClick={() => {
                    if (!media.type.includes("image"))
                        return window.open(mediaUrl);
                    setIsImageDialogOpen(true);
                }}
            >
                <div>
                    {media.type.includes("image") ? (
                        <div className="aspect-square size-10 overflow-hidden rounded-md">
                            <Image
                                src={mediaUrl}
                                alt={media.alt || media.name}
                                width={100}
                                height={100}
                                className="size-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md bg-gray-200 text-gray-500">
                            {getFileIcon(media.type)}
                        </div>
                    )}
                </div>

                <p>{truncateText(fileName, 20)}</p>
            </div>

            <Dialog
                open={isImageDialogOpen}
                onOpenChange={setIsImageDialogOpen}
            >
                <DialogContent className="overflow-hidden p-0">
                    <DialogHeader className="hidden">
                        <DialogTitle>{truncateText(fileName, 20)}</DialogTitle>
                    </DialogHeader>

                    <div className="size-full">
                        <Image
                            src={mediaUrl}
                            alt={media.name}
                            width={500}
                            height={500}
                            className="size-full object-cover"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
