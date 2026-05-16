"use client";

import { Button } from "@/components/ui/button";
import { cn, CreateAboutSection, Icons } from "@workspace/config";
import { Reorder } from "motion/react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface AboutSectionsReorderProps extends GenericProps {
    form: UseFormReturn<{ sections: CreateAboutSection[] }>;
    sectionFields: (CreateAboutSection & { id: string })[];
    onFinish?: () => void;
}

export function AboutSectionsReorder({
    className,
    form,
    sectionFields,
    onFinish,
    ...props
}: AboutSectionsReorderProps) {
    const liveSections = form.watch("sections");

    const [items, setItems] = useState(
        liveSections?.map((section, index) => ({
            ...section,
            id: sectionFields[index]?.id || `section-${index}`,
        })) ?? []
    );

    const handleSave = () => {
        const current = form.watch("sections");

        const map = new Map(
            sectionFields.map((field, index) => [field.id, current?.[index]])
        );

        const reordered = items.map((field, index) => {
            const currentValue = map.get(field.id);
            return currentValue
                ? { ...currentValue, position: index + 1 }
                : { ...field, position: index + 1 };
        });

        form.setValue("sections", reordered, { shouldDirty: true });
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
                            style={{ cursor: "grab" }}
                        >
                            <div className="bg-card flex items-center justify-between gap-2 rounded-md border p-3 py-4">
                                <div className="flex items-center gap-2">
                                    <Icons.DotsSixVertical className="text-muted-foreground size-5" />
                                    <div>
                                        <h4 className="font-semibold">
                                            {item.title || "Untitled"}
                                        </h4>
                                        <p className="text-muted-foreground text-xs capitalize">
                                            {item.type.replace(/_/g, " ")}
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
