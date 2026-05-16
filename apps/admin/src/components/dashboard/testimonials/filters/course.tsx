"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Icons, truncateText } from "@workspace/config";
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
                            ? truncateText(
                                  courses?.find((c) => c.id === value)?.title ??
                                      "Selected",
                                  16
                              )
                            : "All courses"}
                    </SelectValue>
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                <Separator className="my-1" />
                {courses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                        {truncateText(c.title, 30)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
