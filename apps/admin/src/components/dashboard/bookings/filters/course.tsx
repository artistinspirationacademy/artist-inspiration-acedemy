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
import { useCourse } from "@workspace/rq";

interface PageProps {
    value: string | null;
    onChange: (value: string | undefined) => void;
    title?: string;
}

export function CourseFilter({ value, onChange, title = "Course" }: PageProps) {
    const { useScan } = useCourse();
    const { data: courses } = useScan({});

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
                    <Icons.Book />
                    <SelectValue placeholder={title}>
                        {value
                            ? (courses?.find((c) => c.id === value)?.title ??
                              "Course")
                            : "All"}
                    </SelectValue>
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem className="py-1" value="all">
                    All
                </SelectItem>

                {!!courses?.length && <Separator className="my-1" />}

                {courses?.map((c) => (
                    <SelectItem className="py-1" key={c.id} value={c.id}>
                        {c.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
