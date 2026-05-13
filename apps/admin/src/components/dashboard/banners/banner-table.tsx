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
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Banner,
    BANNER_MEDIA_TYPES,
    DEFAULT_PAGINATION,
    generateUploadThingURL,
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
import Image from "next/image";
import {
    parseAsBoolean,
    parseAsInteger,
    parseAsStringLiteral,
    useQueryState,
} from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ActiveFilter, MediaTypeFilter } from "./filters";
import { BannerAction } from "./banner-action";
import { useBanner } from "@workspace/rq";

export type TableBanner = Banner & {
    url: string;
};

const columns = (
    handleSingleDelete: (id: string) => void
): ColumnDef<TableBanner>[] => [
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
        cell: ({ row }) => <BannerPreview banner={row.original} />,
    },
    {
        accessorKey: "mediaType",
        header: "Media Type",
        cell: ({ row }) => (
            <Badge className="whitespace-nowrap uppercase">
                {row.original.mediaType}
            </Badge>
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
            <BannerAction data={row.original} onDelete={handleSingleDelete} />
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

const exportFields: FieldMapping<TableBanner>[] = [
    { source: "id", target: "ID", include: true, order: 0 },
    { source: "name", target: "Name", include: true, order: 1 },
    { source: "mediaType", target: "Media Type", include: true, order: 2 },
    { source: "position", target: "Position", include: true, order: 3 },
    { source: "isActive", target: "Is Active", include: true, order: 4 },
    { source: "url", target: "URL", include: true, order: 5 },
    {
        source: "createdAt",
        target: "Created At",
        include: true,
        order: 6,
        formatter: (data) => format(new Date(data.createdAt), "yyyy-MM-dd"),
    },
    {
        source: "updatedAt",
        target: "Modified At",
        include: true,
        order: 7,
        formatter: (data) => format(new Date(data.updatedAt), "yyyy-MM-dd"),
    },
];

export function BannerTable() {
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit, setLimit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });
    const [mediaType, setMediaType] = useQueryState(
        "mediaType",
        parseAsStringLiteral(BANNER_MEDIA_TYPES)
    );
    const [isActive, setIsActive] = useQueryState("isActive", parseAsBoolean);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<TableBanner[]>([]);

    const { usePaginate, useDelete } = useBanner();
    const {
        data: dataRaw,
        isPending,
        refetch,
    } = usePaginate({
        limit,
        page,
        search,
        mediaType: mediaType ?? undefined,
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

    const handleExport = (_: string[], getSelected?: () => TableBanner[]) => {
        const selected = getSelected ? getSelected() : [];
        setDataToExport(selected);
        setIsExportOpen(true);
    };

    const handleMediaTypeChange = (
        newType: (typeof BANNER_MEDIA_TYPES)[number] | undefined
    ) => {
        setMediaType(newType ?? null);
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

    const data = useMemo(
        () => ({
            ...dataRaw,
            data: dataRaw?.data.map((d) => ({
                ...d,
                url: generateUploadThingURL(d.mediaKey),
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
                                        title: "Are you sure you want to delete the selected banners?",
                                        description:
                                            "Deleting will permanently remove the selected banners and all associated data. This action cannot be undone.",
                                        confirm: "Delete",
                                    },
                                },
                            ]}
                            getSelectedRows={(ids) =>
                                ids
                                    .map((id) =>
                                        data.data?.find((d) => d.id === id)
                                    )
                                    .filter(Boolean) as TableBanner[]
                            }
                        />
                    }
                    filters={[
                        <MediaTypeFilter
                            key="media-type-filter"
                            value={mediaType}
                            onChange={handleMediaTypeChange}
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

            <ExportDialog<TableBanner>
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={dataToExport}
                filename={`banners_export_${format(new Date(), "dd-MM-yyyy")}.csv`}
                fields={exportFields}
            />
        </>
    );
}

function BannerPreview({ banner }: { banner: TableBanner }) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const thumbVideoRef = useRef<HTMLVideoElement>(null);

    const isImage = banner.mediaType === "image";
    const isVideo = banner.mediaType === "video";

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
            await navigator.clipboard.writeText(banner.url);
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
                <div className="bg-muted aspect-video w-16 shrink-0 overflow-hidden rounded-md">
                    {isImage ? (
                        <Image
                            src={banner.url}
                            alt={banner.name}
                            width={64}
                            height={36}
                            className="size-full object-cover"
                        />
                    ) : isVideo ? (
                        <video
                            ref={thumbVideoRef}
                            src={`${banner.url}#t=0.5`}
                            preload="metadata"
                            muted
                            playsInline
                            loop
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-gray-200 text-gray-500">
                            <Icons.FileVideo className="size-5" />
                        </div>
                    )}
                </div>

                <p>{truncateText(banner.name, 20)}</p>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="w-[95vw] sm:max-w-3xl xl:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle className="truncate">
                            {banner.name}
                        </DialogTitle>
                        <DialogDescription className="capitalize">
                            {banner.mediaType} banner
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted flex min-w-0 items-center justify-center overflow-hidden rounded-md">
                        {isImage ? (
                            <Image
                                src={banner.url}
                                alt={banner.name}
                                width={1280}
                                height={720}
                                className="block max-h-[70vh] w-auto max-w-full object-contain"
                                unoptimized
                            />
                        ) : (
                            <video
                                src={banner.url}
                                controls
                                autoPlay
                                className="block max-h-[70vh] w-full max-w-full object-contain"
                            />
                        )}
                    </div>

                    <DialogFooter className="items-center sm:justify-between">
                        <p
                            className="text-muted-foreground truncate font-mono text-xs"
                            title={banner.url}
                        >
                            {banner.url}
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
                                    href={banner.url}
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
