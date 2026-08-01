"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@workspace/config";
import { Reorder } from "motion/react";
import Papa from "papaparse";
import { useState } from "react";

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export type NestedPaths<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
      ? {
            [K in keyof T]-?: K extends string | number
                ? `${K}` | `${K}${DotPrefix<NestedPaths<T[K], Prev[D]>>}`
                : never;
        }[keyof T]
      : "";

function getValueByPath<T extends Record<string, unknown>>(
    obj: T,
    path: string
): unknown {
    if (!path) return undefined;

    return path.split(".").reduce<unknown>((acc, part) => {
        if (acc === null || acc === undefined) return acc;
        return (acc as Record<string, unknown>)[part];
    }, obj);
}

export interface FieldMapping<T extends Record<string, unknown>> {
    source: keyof T | NestedPaths<T>;
    target: string;
    include: boolean;
    order: number;
    formatter?: (row: T) => string | number | boolean | null | undefined;
}

export interface ExportDialogProps<T extends Record<string, unknown>> {
    isOpen: boolean;
    onClose: () => void;
    data: T[];
    filename?: string;
    fields?: FieldMapping<T>[];
}

export function ExportDialog<T extends Record<string, unknown>>({
    isOpen,
    onClose,
    data,
    filename = "export.csv",
    fields: initialFields,
}: ExportDialogProps<T>) {
    const [fields, setFields] = useState<FieldMapping<T>[]>(() => {
        if (initialFields) return [...initialFields];
        if (!data.length) return [];

        const sampleData = data[0] ?? ({} as T);
        return Object.keys(sampleData).map((key, index) => ({
            source: key as keyof T,
            target: key,
            include: true,
            order: index,
        }));
    });
    const [exportFilename, setExportFilename] = useState(filename);

    const toggleField = (fieldSource: string, checked: boolean) => {
        setFields((prev) =>
            prev.map((field) =>
                field.source === fieldSource
                    ? { ...field, include: checked }
                    : field
            )
        );
    };

    const updateFieldName = (fieldSource: string, name: string) => {
        setFields((prev) =>
            prev.map((field) =>
                field.source === fieldSource
                    ? { ...field, target: name }
                    : field
            )
        );
    };

    const handleExport = () => {
        if (!data.length) return;

        const processedData = data.map((item) => {
            const newItem: Record<string, unknown> = {};

            fields
                .filter((field) => field.include)
                .forEach((field) => {
                    if (field.formatter) {
                        newItem[field.target] = field.formatter(item);
                    } else if (
                        typeof field.source === "string" &&
                        field.source.includes(".")
                    ) {
                        newItem[field.target] = getValueByPath(
                            item,
                            field.source
                        );
                    } else {
                        newItem[field.target] = item[field.source as keyof T];
                    }
                });

            return newItem;
        });

        const csv = Papa.unparse(processedData);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            exportFilename.endsWith(".csv")
                ? exportFilename
                : `${exportFilename}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="lg:max-w-md">
                <DialogHeader>
                    <DialogTitle>Export to CSV</DialogTitle>
                    <DialogDescription>
                        Select the fields to include in your CSV export,
                        customize their names, and drag to reorder.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="filename">File Name</Label>
                        <Input
                            id="filename"
                            value={exportFilename}
                            onChange={(e) => setExportFilename(e.target.value)}
                            placeholder="export.csv"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fields to Export (drag to reorder)</Label>

                        <ScrollArea className="h-75">
                            <div className="overflow-hidden rounded-md border p-4">
                                <Reorder.Group
                                    axis="y"
                                    values={fields}
                                    onReorder={setFields}
                                    className="space-y-2"
                                >
                                    {fields.map((field) => (
                                        <Reorder.Item
                                            key={String(field.source)}
                                            value={field}
                                            style={{ cursor: "grab" }}
                                        >
                                            <div className="bg-background mb-2 flex items-center gap-2 rounded-md border p-3">
                                                <div className="flex touch-none items-center">
                                                    <Icons.DotsSixVertical className="text-muted-foreground h-5 w-5" />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`field-${String(field.source)}`}
                                                        checked={field.include}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            toggleField(
                                                                field.source as string,
                                                                !!checked
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`field-${String(field.source)}`}
                                                        className="min-w-24"
                                                    >
                                                        {String(field.source)}
                                                    </Label>
                                                </div>

                                                <div className="flex flex-1 items-center">
                                                    <Input
                                                        value={field.target}
                                                        onChange={(e) =>
                                                            updateFieldName(
                                                                field.source as string,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Field name in CSV"
                                                        disabled={
                                                            !field.include
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button onClick={handleExport}>Export CSV</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
