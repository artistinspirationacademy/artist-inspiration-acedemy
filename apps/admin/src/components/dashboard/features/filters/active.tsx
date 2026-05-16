"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Icons } from "@workspace/config";

interface PageProps {
    value: boolean | null;
    onChange: (value: boolean | undefined) => void;
    title?: string;
}

export function ActiveFilter({ value, onChange, title = "Status" }: PageProps) {
    const selectedValue =
        value === null || value === undefined ? "all" : String(value);

    return (
        <Select
            value={selectedValue}
            onValueChange={(newValue) => {
                if (newValue === "all") onChange(undefined);
                else onChange(newValue === "true");
            }}
        >
            <SelectTrigger className="w-37.5">
                <div className="flex items-center gap-2">
                    <Icons.Eye />
                    <SelectValue placeholder={title}>
                        {value === null || value === undefined
                            ? "All"
                            : value
                              ? "Active"
                              : "Inactive"}
                    </SelectValue>
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
        </Select>
    );
}
