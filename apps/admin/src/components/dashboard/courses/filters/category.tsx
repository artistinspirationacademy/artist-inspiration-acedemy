"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@workspace/config";
import { useCourseCategory } from "@workspace/rq";

interface PageProps {
    value: string | null;
    onChange: (value: string | undefined) => void;
    title?: string;
}

export function CategoryFilter({
    value,
    onChange,
    title = "Category",
}: PageProps) {
    const { useScan } = useCourseCategory();
    const { data: categories } = useScan({});

    const selectedValue = value ?? "all";

    return (
        <Select
            value={selectedValue}
            onValueChange={(newValue) => {
                onChange(newValue === "all" ? undefined : newValue);
            }}
        >
            <SelectTrigger className="w-44">
                <div className="flex items-center gap-2">
                    <Icons.Folder />
                    <SelectValue placeholder={title}>
                        {value
                            ? (categories?.find((c) => c.id === value)?.name ??
                              "Category")
                            : "All"}
                    </SelectValue>
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem className="py-1" value="all">
                    All
                </SelectItem>

                {!!categories?.length && <Separator className="my-1" />}

                {categories?.map((c) => (
                    <SelectItem className="py-1" key={c.id} value={c.id}>
                        {c.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
