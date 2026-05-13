"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    cn,
    DEFAULT_PAGINATION,
    generateUploadThingURL,
    Icons,
    Media,
    MEDIA_FILE_ACCEPT,
    MEDIA_TYPES,
} from "@workspace/config";
import { useMedia } from "@workspace/rq";
import Image from "next/image";
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from "react";

interface PageProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    selected?: Media[];
    /**
     * Pre-select the row whose `key` matches once it loads. Useful when the
     * caller only has the key (e.g. editing a banner), not a full Media object.
     */
    selectedKey?: string;
    types?: (typeof MEDIA_TYPES)[number][];
    multiple?: boolean;
    accept?: string;
    onSelectionComplete?: (items: Media[]) => void;
}

const PAGE_SIZE = 12;

export function MediaSelectModal({
    isOpen,
    setIsOpen,
    selected = [],
    selectedKey,
    types,
    multiple = false,
    accept = MEDIA_FILE_ACCEPT.join(","),
    onSelectionComplete,
}: PageProps) {
    const [page, setPage] = useState<number>(DEFAULT_PAGINATION.GENERAL.PAGE);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState<Media[]>(selected);

    const [autoSelectedKey, setAutoSelectedKey] = useState<string | undefined>(
        undefined
    );

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setSelectedItems(selected);
            setAutoSelectedKey(undefined);
        }
    }

    const [prevSearch, setPrevSearch] = useState(debouncedSearch);
    if (debouncedSearch !== prevSearch) {
        setPrevSearch(debouncedSearch);
        setPage(DEFAULT_PAGINATION.GENERAL.PAGE);
    }

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(handler);
    }, [search]);

    const { usePaginate, useCreate } = useMedia();
    const {
        data: paginated,
        isFetching,
        refetch,
    } = usePaginate({
        limit: PAGE_SIZE,
        page,
        search: debouncedSearch || undefined,
        types,
        enabled: isOpen,
    });
    const { mutateAsync, isPending: isUploading } = useCreate();

    const items = paginated?.data ?? [];
    const pageCount = paginated?.pages ?? 0;
    const totalCount = paginated?.count ?? 0;

    const keyMatch =
        isOpen && selectedKey && selectedKey !== autoSelectedKey
            ? items.find((m) => m.key === selectedKey)
            : undefined;
    if (keyMatch && selectedKey) {
        setAutoSelectedKey(selectedKey);
        if (!selectedItems.some((s) => s.id === keyMatch.id)) {
            setSelectedItems((prev) =>
                multiple ? [...prev, keyMatch] : [keyMatch]
            );
        }
    }

    const handleSelectionChange = (media: Media, isSelected: boolean) => {
        setSelectedItems((prev) => {
            if (!multiple) return isSelected ? [media] : [];
            return isSelected
                ? [...prev, media]
                : prev.filter((x) => x.id !== media.id);
        });
    };

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        await mutateAsync({ files: Array.from(e.target.files) });
        e.target.value = "";
        setPage(DEFAULT_PAGINATION.GENERAL.PAGE);
        refetch();
    };

    const handleComplete = () => {
        onSelectionComplete?.(selectedItems);
        setIsOpen(false);
        setSearch("");
    };

    const handleCancel = () => {
        setIsOpen(false);
        setSearch("");
        setSelectedItems(selected);
    };

    const getModalTitle = () => {
        if (types?.length === 1 && types[0] === "image") return "Select Images";
        if (types?.length === 1 && types[0] === "video") return "Select Videos";
        if (
            types?.length === 2 &&
            types.includes("image") &&
            types.includes("video")
        )
            return "Select Media";
        if (accept === "image/*") return "Select Images";
        if (accept === "application/pdf,.pdf") return "Select PDF Files";
        return "Select Files";
    };

    const getModalDescription = () => {
        if (types?.length === 1 && types[0] === "image")
            return "Select existing images or upload new image files";
        if (types?.length === 1 && types[0] === "video")
            return "Select existing videos or upload new video files";
        if (
            types?.length === 2 &&
            types.includes("image") &&
            types.includes("video")
        )
            return "Select existing media or upload new files";
        return "Select existing files or upload new files";
    };

    const getUploadButtonText = () => {
        if (types?.length === 1 && types[0] === "image") return "Upload Images";
        if (types?.length === 1 && types[0] === "video") return "Upload Videos";
        return "Upload Media";
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="sm:max-w-4xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{getModalTitle()}</DialogTitle>
                    <DialogDescription>
                        {getModalDescription()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <Button
                        className="w-full"
                        disabled={isUploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Icons.Upload className="mr-2 size-5" />
                        {isUploading ? "Uploading..." : getUploadButtonText()}
                    </Button>

                    <input
                        ref={inputRef}
                        multiple
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleUpload}
                    />

                    <div className="bg-foreground/20 relative h-px w-full">
                        <p className="bg-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-sm font-medium">
                            OR
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            type="search"
                            placeholder="Search files..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid max-h-80 grid-cols-2 gap-4 overflow-y-auto rounded-lg border p-2 md:grid-cols-6">
                        {isFetching && items.length === 0 ? (
                            Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <Skeleton
                                    key={`media-skeleton-${i}`}
                                    className="aspect-square w-full rounded-md"
                                />
                            ))
                        ) : items.length > 0 ? (
                            items.map((media) => (
                                <MediaSelectItem
                                    key={media.id}
                                    media={media}
                                    selectedItems={selectedItems}
                                    multiple={multiple}
                                    onSelectionChange={(isSelected) =>
                                        handleSelectionChange(media, isSelected)
                                    }
                                />
                            ))
                        ) : (
                            <div className="text-muted-foreground col-span-full flex items-center justify-center py-8">
                                {debouncedSearch
                                    ? "No files found"
                                    : "No media files available"}
                            </div>
                        )}
                    </div>

                    {pageCount > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground text-xs">
                                {totalCount} item{totalCount === 1 ? "" : "s"}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page <= 1 || isFetching}
                                >
                                    <Icons.CaretLeft className="size-4" />
                                    Prev
                                </Button>
                                <span className="text-muted-foreground min-w-20 text-center text-xs">
                                    Page {page} of {pageCount}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(pageCount, p + 1)
                                        )
                                    }
                                    disabled={page >= pageCount || isFetching}
                                >
                                    Next
                                    <Icons.CaretRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button type="button" onClick={handleComplete}>
                        Select{" "}
                        {selectedItems.length > 0 &&
                            `(${selectedItems.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CompProps {
    media: Media;
    onSelectionChange: (isSelected: boolean) => void;
    selectedItems: Media[];
    multiple: boolean;
}

function MediaSelectItem({
    media,
    onSelectionChange,
    selectedItems,
}: CompProps) {
    const fileType = media.name.split(".").pop();
    const fileName = media.name.split(".").slice(0, -1).join(".");
    const videoRef = useRef<HTMLVideoElement>(null);

    const mediaUrl = generateUploadThingURL(media.key);

    const isMediaImage = media.type.startsWith("image");
    const isMediaVideo = media.type.startsWith("video");
    const isSelected = selectedItems.some((item) => item.id === media.id);

    const handleSelection = (value: boolean) => {
        onSelectionChange(value);
    };

    const handleHoverStart = () => {
        if (!isMediaVideo || !videoRef.current) return;
        videoRef.current.play().catch(() => {
            // ignore autoplay rejections
        });
    };

    const handleHoverEnd = () => {
        if (!isMediaVideo || !videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0.5;
    };

    return (
        <div className="space-y-2">
            <div
                className={cn(
                    "hover:bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-md border p-2 transition-all ease-in-out",
                    isSelected && "border-primary bg-primary/5"
                )}
                onClick={() => handleSelection(!isSelected)}
                onMouseEnter={handleHoverStart}
                onMouseLeave={handleHoverEnd}
            >
                {isMediaImage ? (
                    <Image
                        src={mediaUrl}
                        alt={fileName}
                        height={200}
                        width={200}
                        className="size-full rounded-sm object-cover"
                        unoptimized
                    />
                ) : isMediaVideo ? (
                    <video
                        ref={videoRef}
                        src={`${mediaUrl}#t=0.5`}
                        preload="metadata"
                        muted
                        playsInline
                        loop
                        className="size-full rounded-sm object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md bg-gray-200 text-gray-500">
                            <Icons.FileText className="size-5" />
                        </div>
                    </div>
                )}

                <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleSelection}
                    className="bg-background absolute top-3 left-3"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            <div className="space-y-1 text-center">
                <p className="truncate text-xs font-semibold" title={fileName}>
                    {fileName}
                </p>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                    {fileType}
                </p>
            </div>
        </div>
    );
}
