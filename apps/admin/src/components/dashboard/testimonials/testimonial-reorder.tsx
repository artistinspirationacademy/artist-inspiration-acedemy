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
import { FullTestimonial, Icons } from "@workspace/config";
import { useTestimonial } from "@workspace/rq";
import { Reorder } from "motion/react";
import { useState } from "react";

export function TestimonialReorderDialog() {
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
                    <DialogTitle>Reorder Testimonials</DialogTitle>
                    <DialogDescription>
                        Drag to set the display order on the home page.
                    </DialogDescription>
                </DialogHeader>

                {isOpen && (
                    <TestimonialReorderBody onClose={() => setIsOpen(false)} />
                )}
            </DialogContent>
        </Dialog>
    );
}

function TestimonialReorderBody({ onClose }: { onClose: () => void }) {
    const { useScan, useReorder } = useTestimonial();
    const { data, isPending } = useScan({});
    const { mutateAsync, isPending: isSaving } = useReorder();

    const [items, setItems] = useState<FullTestimonial[]>([]);
    const [hydrated, setHydrated] = useState(false);

    if (!hydrated && data) {
        setHydrated(true);
        setItems([...data].sort((a, b) => a.position - b.position));
    }

    const handleSave = async () => {
        const values = items.map((t, index) => ({
            id: t.id,
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
                No testimonials to reorder.
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
                    {items.map((t) => (
                        <Reorder.Item
                            key={t.id}
                            value={t}
                            style={{ cursor: "grab" }}
                        >
                            <div className="bg-background flex items-center gap-3 rounded-md border p-3 shadow-sm">
                                <Icons.DotsSixVertical className="text-muted-foreground size-5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {t.name}
                                    </p>
                                    <p className="text-muted-foreground line-clamp-1 text-xs">
                                        {t.feedback}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Icons.Star
                                            key={i}
                                            weight={
                                                i < t.rating
                                                    ? "fill"
                                                    : "regular"
                                            }
                                            className={
                                                i < t.rating
                                                    ? "text-highlight size-3.5"
                                                    : "text-muted-foreground size-3.5"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
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
