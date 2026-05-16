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
import { Feature, generateUploadThingURL, Icons } from "@workspace/config";
import { useFeature } from "@workspace/rq";
import { Reorder } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export function FeatureReorderDialog() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Icons.DotsSixVertical />
                    Reorder
                </Button>
            </DialogTrigger>

            <DialogContent
                className="sm:max-w-lg"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Reorder Features</DialogTitle>
                    <DialogDescription>
                        Drag to set the display order on the home page.
                    </DialogDescription>
                </DialogHeader>

                {isOpen && (
                    <FeatureReorderBody onClose={() => setIsOpen(false)} />
                )}
            </DialogContent>
        </Dialog>
    );
}

function FeatureReorderBody({ onClose }: { onClose: () => void }) {
    const { useScan, useReorder } = useFeature();
    const { data, isPending } = useScan({});
    const { mutateAsync, isPending: isSaving } = useReorder();

    const [items, setItems] = useState<Feature[]>([]);
    const [hydrated, setHydrated] = useState(false);

    if (!hydrated && data) {
        setHydrated(true);
        setItems([...data].sort((a, b) => a.position - b.position));
    }

    const handleSave = async () => {
        const values = items.map((feature, index) => ({
            id: feature.id,
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
                No features to reorder.
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
                    {items.map((feature) => (
                        <Reorder.Item
                            key={feature.id}
                            value={feature}
                            style={{ cursor: "grab" }}
                        >
                            <FeatureReorderRow feature={feature} />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </ScrollArea>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" disabled={isSaving}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Order"}
                </Button>
            </DialogFooter>
        </>
    );
}

function FeatureReorderRow({ feature }: { feature: Feature }) {
    const url = generateUploadThingURL(feature.imageKey);

    return (
        <div className="bg-background flex items-center gap-3 rounded-md border p-2 shadow-sm">
            <Icons.DotsSixVertical className="text-muted-foreground size-5 shrink-0" />

            <div className="bg-muted aspect-square w-12 shrink-0 overflow-hidden rounded-sm">
                <Image
                    src={url}
                    alt={feature.name}
                    width={64}
                    height={64}
                    className="size-full object-cover"
                    unoptimized
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{feature.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                    {feature.description}
                </p>
            </div>
        </div>
    );
}
