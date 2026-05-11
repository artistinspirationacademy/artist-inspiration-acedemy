"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { convertValueToLabel, Icons, MEDIA_TYPES } from "@workspace/config";

interface PageProps {
    value: (typeof MEDIA_TYPES)[number] | null;
    onChange: (value: (typeof MEDIA_TYPES)[number] | undefined) => void;
    title?: string;
}

export function TypeFilter({ value, onChange, title = "Type" }: PageProps) {
    const types = ["all", ...MEDIA_TYPES].map((type) => ({
        label: convertValueToLabel(type),
        value: type,
    }));

    const selectedValue = value ? value.toString() : "all";

    return (
        <Select
            value={selectedValue}
            onValueChange={(newValue) => {
                onChange(
                    newValue === "all"
                        ? undefined
                        : (newValue as (typeof MEDIA_TYPES)[number])
                );
            }}
        >
            <SelectTrigger className="w-37.5">
                <div className="flex items-center gap-2">
                    <Icons.File />
                    <SelectValue placeholder={title}>
                        {value !== undefined && value !== null
                            ? convertValueToLabel(value)
                            : "All"}
                    </SelectValue>
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem
                    className="py-1"
                    key={types[0]!.value}
                    value={types[0]!.value}
                >
                    {types[0]!.label}
                </SelectItem>

                <Separator className="my-1" />

                {types.slice(1).map((t) => (
                    <SelectItem className="py-1" key={t.value} value={t.value}>
                        {t.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
