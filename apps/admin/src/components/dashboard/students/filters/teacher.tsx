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
import { useTeacher } from "@workspace/rq";

interface PageProps {
    value: string | null;
    onChange: (value: string | undefined) => void;
    title?: string;
}

export function TeacherFilter({
    value,
    onChange,
    title = "Teacher",
}: PageProps) {
    const { useScan } = useTeacher();
    const { data: teachers } = useScan({});

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
                    <Icons.Teacher />
                    <SelectValue placeholder={title}>
                        {value
                            ? (teachers?.find((t) => t.id === value)?.name ??
                              "Teacher")
                            : "All"}
                    </SelectValue>
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem className="py-1" value="all">
                    All
                </SelectItem>

                {!!teachers?.length && <Separator className="my-1" />}

                {teachers?.map((t) => (
                    <SelectItem className="py-1" key={t.id} value={t.id}>
                        {t.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
