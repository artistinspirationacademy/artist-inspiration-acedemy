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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import {
    parseAsArrayOf,
    parseAsInteger,
    parseAsStringLiteral,
    useQueryState,
} from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
            return <MediaPreview media={data} />;
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
    const [types, setTypes] = useQueryState(
        "types",
        parseAsArrayOf(parseAsStringLiteral(MEDIA_TYPES))
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
        types: types ?? undefined,
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
        setTypes(newType ? [newType] : null);
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
                            value={types?.[0] ?? null}
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

function MediaPreview({ media }: { media: Media }) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const thumbVideoRef = useRef<HTMLVideoElement>(null);

    const fileName = media.name.split(".").slice(0, -1).join(".");
    if (!fileName) return "unnamed";

    const mediaUrl = generateUploadThingURL(media.key);
    const isImage = media.type.startsWith("image");
    const isVideo = media.type.startsWith("video");
    const isAudio = media.type.startsWith("audio");

    const handleHoverStart = () => {
        if (!isVideo || !thumbVideoRef.current) return;
        thumbVideoRef.current.play().catch(() => {
            // ignore autoplay rejections
        });
    };

    const handleHoverEnd = () => {
        if (!isVideo || !thumbVideoRef.current) return;
        thumbVideoRef.current.pause();
        thumbVideoRef.current.currentTime = 0.5;
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(mediaUrl);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Couldn't copy link");
        }
    };

    return (
        <>
            <div
                className="flex items-center gap-2 hover:cursor-pointer hover:underline"
                onClick={() => setIsPreviewOpen(true)}
                onMouseEnter={handleHoverStart}
                onMouseLeave={handleHoverEnd}
            >
                <div className="bg-muted aspect-square size-10 shrink-0 overflow-hidden rounded-md">
                    {isImage ? (
                        <Image
                            src={mediaUrl}
                            alt={media.alt || media.name}
                            width={80}
                            height={80}
                            className="size-full object-cover"
                        />
                    ) : isVideo ? (
                        <video
                            ref={thumbVideoRef}
                            src={`${mediaUrl}#t=0.5`}
                            preload="metadata"
                            muted
                            playsInline
                            loop
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-gray-200 text-gray-500">
                            {getFileIcon(media.type)}
                        </div>
                    )}
                </div>

                <p>{truncateText(fileName, 20)}</p>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="w-[95vw] sm:max-w-3xl xl:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle className="truncate">
                            {fileName}
                        </DialogTitle>
                        <DialogDescription className="truncate">
                            {media.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted flex min-w-0 items-center justify-center overflow-hidden rounded-md">
                        {isImage && (
                            <Image
                                src={mediaUrl}
                                alt={media.alt || media.name}
                                width={1280}
                                height={720}
                                className="block max-h-[70vh] w-auto max-w-full object-contain"
                                unoptimized
                            />
                        )}
                        {isVideo && (
                            <video
                                src={mediaUrl}
                                controls
                                autoPlay
                                className="block max-h-[70vh] w-full max-w-full object-contain"
                            />
                        )}
                        {isAudio && (
                            <div className="w-full p-6">
                                <audio
                                    src={mediaUrl}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        )}
                        {!isImage && !isVideo && !isAudio && (
                            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12">
                                {getFileIcon(media.type)}
                                <p className="text-sm">
                                    No inline preview available
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="items-center sm:justify-between">
                        <p
                            className="text-muted-foreground truncate font-mono text-xs"
                            title={mediaUrl}
                        >
                            {mediaUrl}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCopyLink}
                            >
                                Copy link
                            </Button>
                            <Button type="button" asChild>
                                <a
                                    href={mediaUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    Open in new tab
                                </a>
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
