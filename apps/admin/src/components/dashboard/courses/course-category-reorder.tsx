"use client";

import { Badge } from "@/components/ui/badge";
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
import { CourseCategory, Icons } from "@workspace/config";
import { useCourseCategory } from "@workspace/rq";
import { Reorder } from "motion/react";
import { useState } from "react";

export function CourseCategoryReorderDialog() {
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
                    <DialogTitle>Reorder Categories</DialogTitle>
                    <DialogDescription>
                        Drag to set the display order on the courses page.
                    </DialogDescription>
                </DialogHeader>

                {isOpen && (
                    <CourseCategoryReorderBody
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function CourseCategoryReorderBody({ onClose }: { onClose: () => void }) {
    const { useScan, useReorder } = useCourseCategory();
    const { data, isPending } = useScan({});
    const { mutateAsync, isPending: isSaving } = useReorder();

    const [items, setItems] = useState<CourseCategory[]>([]);
    const [hydrated, setHydrated] = useState(false);

    if (!hydrated && data) {
        setHydrated(true);
        setItems([...data].sort((a, b) => a.position - b.position));
    }

    const handleSave = async () => {
        const values = items.map((category, index) => ({
            id: category.id,
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
                        key={`category-reorder-skeleton-${i}`}
                        className="h-14 w-full"
                    />
                ))}
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="text-muted-foreground py-8 text-center text-sm">
                No categories to reorder.
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
                    {items.map((category) => (
                        <Reorder.Item
                            key={category.id}
                            value={category}
                            style={{ cursor: "grab" }}
                        >
                            <CourseCategoryReorderRow category={category} />
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

function CourseCategoryReorderRow({ category }: { category: CourseCategory }) {
    return (
        <div className="bg-background flex items-center gap-3 rounded-md border p-3 shadow-sm">
            <Icons.DotsSixVertical className="text-muted-foreground size-5 shrink-0" />

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                        {category.name}
                    </p>
                    {category.isActive ? (
                        <Badge>Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                </div>
                <p className="text-muted-foreground truncate font-mono text-xs">
                    {category.slug}
                </p>
            </div>
        </div>
    );
}
