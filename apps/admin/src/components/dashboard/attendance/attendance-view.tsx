"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Icons, monthKey } from "@workspace/config";
import { useTeacher } from "@workspace/rq";
import { parseAsString, useQueryState } from "nuqs";
import { AttendanceSheet } from "./attendance-sheet";

export function AttendanceView() {
    const [teacherId, setTeacherId] = useQueryState("teacherId", parseAsString);
    const [month, setMonth] = useQueryState(
        "month",
        parseAsString.withDefault(monthKey())
    );

    const { useScan } = useTeacher();
    const { data: teachers = [], isPending } = useScan({});

    const selected = teachers.find((teacher) => teacher.id === teacherId);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={teacherId ?? undefined}
                    onValueChange={(value) => setTeacherId(value)}
                    disabled={isPending}
                >
                    <SelectTrigger className="w-60">
                        <div className="flex items-center gap-2">
                            <Icons.Teacher />
                            <SelectValue placeholder="Select a teacher" />
                        </div>
                    </SelectTrigger>

                    <SelectContent>
                        {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!teacherId ? (
                <Card size="sm">
                    <CardContent className="space-y-1 py-10 text-center">
                        <p className="text-sm font-medium">
                            Pick a teacher to open their sheet
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Each sheet covers one teacher for one month. You can
                            edit every field, including names and student IDs.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <AttendanceSheet
                    month={month}
                    onMonthChange={(next) => setMonth(next)}
                    teacherId={teacherId}
                    teacherName={selected?.name}
                    canEditIdentity
                    canLock
                />
            )}
        </div>
    );
}
