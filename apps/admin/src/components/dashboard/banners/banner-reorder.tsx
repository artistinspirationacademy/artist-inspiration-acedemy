"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner, generateUploadThingURL, Icons } from "@workspace/config";
import { useBanner } from "@workspace/rq";
import { Reorder } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export function BannerReorderDialog() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Icons.DotsSixVertical className="mr-1 size-4" />
                    Reorder
                </Button>
            </DialogTrigger>

            <DialogContent
                className="sm:max-w-lg"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Reorder Banners</DialogTitle>
                    <DialogDescription>
                        Drag to set the display order. Lower items appear
                        later.
                    </DialogDescription>
                </DialogHeader>

                {isOpen && <BannerReorderBody onClose={() => setIsOpen(false)} />}
            </DialogContent>
        </Dialog>
    );
}

function BannerReorderBody({ onClose }: { onClose: () => void }) {
    const { useScan, useReorder } = useBanner();
    const { data, isPending } = useScan({});
    const { mutateAsync, isPending: isSaving } = useReorder();

    const [items, setItems] = useState<Banner[]>([]);
    const [hydrated, setHydrated] = useState(false);

    if (!hydrated && data) {
        setHydrated(true);
        setItems([...data].sort((a, b) => a.position - b.position));
    }

    const handleSave = async () => {
        const values = items.map((banner, index) => ({
            id: banner.id,
            position: index,
        }));
        await mutateAsync({ values });
        onClose();
    };

    if (isPending) {
        return (
            <div className="space-y-2 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                        key={`reorder-skeleton-${i}`}
                        className="h-14 w-full"
                    />
                ))}
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="text-muted-foreground py-8 text-center text-sm">
                No banners to reorder.
            </div>
        );
    }

    return (
        <>
            <ScrollArea className="max-h-96">
                <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={setItems}
                    className="space-y-2 p-1"
                >
                    {items.map((banner) => (
                        <Reorder.Item
                            key={banner.id}
                            value={banner}
                            style={{ cursor: "grab" }}
                        >
                            <BannerReorderRow banner={banner} />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </ScrollArea>

            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Order"}
                </Button>
            </DialogFooter>
        </>
    );
}

function BannerReorderRow({ banner }: { banner: Banner }) {
    const url = generateUploadThingURL(banner.mediaKey);

    return (
        <div className="bg-background flex items-center gap-3 rounded-md border p-2 shadow-sm">
            <Icons.DotsSixVertical className="text-muted-foreground size-5 shrink-0" />

            <div className="bg-muted aspect-video w-16 shrink-0 overflow-hidden rounded-sm">
                {banner.mediaType === "image" ? (
                    <Image
                        src={url}
                        alt={banner.name}
                        width={96}
                        height={54}
                        className="size-full object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-gray-500">
                        <Icons.FileVideo className="size-5" />
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{banner.name}</p>
                <p className="text-muted-foreground text-xs capitalize">
                    {banner.mediaType}
                </p>
            </div>
        </div>
    );
}
