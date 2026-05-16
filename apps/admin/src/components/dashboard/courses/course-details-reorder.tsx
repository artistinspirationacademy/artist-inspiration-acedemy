"use client";

import { Button } from "@/components/ui/button";
import { cn, Icons, UpdateCourse } from "@workspace/config";
import { Reorder } from "motion/react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface CourseDetailsReorderProps extends GenericProps {
    form: UseFormReturn<UpdateCourse>;
    detailFields: (NonNullable<UpdateCourse["details"]>[number] & {
        id: string;
    })[];
    onFinish?: () => void;
}

export function CourseDetailsReorder({
    className,
    form,
    detailFields,
    onFinish,
    ...props
}: CourseDetailsReorderProps) {
    const liveDetails = form.watch("details");

    const [items, setItems] = useState(
        liveDetails?.map((detail, index) => ({
            ...detail,
            id: detailFields[index]?.id || `detail-${index}`,
        })) ?? []
    );

    const handleSave = () => {
        const currentDetails = form.watch("details");

        const detailsMap = new Map(
            detailFields.map((field, index) => [
                field.id,
                currentDetails?.[index],
            ])
        );

        const reorderedDetails = items.map((field, index) => {
            const currentValue = detailsMap.get(field.id);
            return currentValue
                ? { ...currentValue, position: index + 1 }
                : { ...field, position: index + 1 };
        });

        form.setValue("details", reorderedDetails, { shouldDirty: true });
        onFinish?.();
    };

    return (
        <div className={cn("space-y-4", className)} {...props}>
            <div className="overflow-hidden">
                <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={setItems}
                    className="space-y-2"
                >
                    {items.map((item, i) => (
                        <Reorder.Item
                            key={item.id}
                            value={item}
                            className="list-none"
                            style={{
                                cursor: "grab",
                            }}
                        >
                            <div className="bg-card flex items-center justify-between gap-2 rounded-md border p-3 py-4">
                                <div className="flex items-center gap-2">
                                    <Icons.DotsSixVertical className="text-muted-foreground size-5" />
                                    <div>
                                        <h4 className="font-semibold">
                                            {item.title || "Untitled"}
                                        </h4>
                                        <p className="text-muted-foreground text-xs capitalize">
                                            {item.type}
                                        </p>
                                    </div>
                                </div>

                                <p className="bg-foreground text-background flex size-6 items-center justify-center rounded-full p-2 text-sm font-semibold">
                                    {i + 1}
                                </p>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => onFinish?.()}>
                    Cancel
                </Button>

                <Button
                    disabled={items.every((item, i) => item.position === i + 1)}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </div>
        </div>
    );
}
