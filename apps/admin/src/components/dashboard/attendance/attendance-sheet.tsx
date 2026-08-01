"use client";

import { AttendanceSheetSkeleton } from "@/components/globals/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthPicker } from "@/components/ui/month-picker";
import {
    ATTENDANCE_STATUS_LABELS,
    ATTENDANCE_STATUSES,
    AttendanceSheet as AttendanceSheetData,
    AttendanceSheetRow,
    AttendanceStatus,
    cFetch,
    cn,
    displayStudentId,
    formatFeeTag,
    handleClientError,
    Icons,
    monthDates,
    monthKey,
    shiftMonthKey,
} from "@workspace/config";
import { useAttendance, useStudent } from "@workspace/rq";
import Papa from "papaparse";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FLUSH_DELAY_MS = 400;
const SHEET_PAGE_SIZE = 50;

/**
 * The table uses a fixed layout, so these widths are exact. The frozen-pane
 * `left` offsets are derived from the same values and can never drift out of
 * sync with the rendered columns. `student` is the only flexible column: it
 * absorbs spare width on large screens and never shrinks below this minimum.
 */
const COL_WIDTHS = {
    serial: 48,
    student: 224,
    id: 96,
    academyFee: 112,
    teacherFee: 112,
    classes: 64,
    months: 64,
    present: 60,
    absent: 60,
    rescheduled: 60,
    left: 56,
    lock: 52,
    day: 36,
} as const;

const STATUS_STYLES: Record<AttendanceStatus, string> = {
    present:
        "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400",
    absent: "bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400",
    rescheduled:
        "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400",
};

const FOOT_CELL = "bg-background sticky bottom-0 z-20 border-t border-b-0";

const cellKey = (monthId: string, date: string) => `${monthId}:${date}`;

function nextStatus(current: AttendanceStatus | null): AttendanceStatus | null {
    if (current === null) return "present";

    const index = ATTENDANCE_STATUSES.indexOf(current);
    return ATTENDANCE_STATUSES[index + 1] ?? null;
}

interface PageProps {
    month: string;
    onMonthChange: (month: string) => void;
    teacherId?: string;
    teacherName?: string;
    canEditIdentity?: boolean;
    canLock?: boolean;
}

export function AttendanceSheet({
    month,
    onMonthChange,
    teacherId,
    teacherName,
    canEditIdentity = false,
    canLock = false,
}: PageProps) {
    const days = useMemo(() => monthDates(month), [month]);
    const today = monthKey() === month ? new Date().getDate() : null;

    const [page, setPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    // reset during render (not in an effect) when the sheet identity changes
    const sheetKey = `${teacherId}:${month}`;
    const [prevSheetKey, setPrevSheetKey] = useState(sheetKey);
    if (prevSheetKey !== sheetKey) {
        setPrevSheetKey(sheetKey);
        setPage(1);
    }

    const { useSheet, useMarkDays, useUpdateMonth, useSync } = useAttendance();
    const { data, isPending, refetch } = useSheet({
        month,
        teacherId,
        page,
        limit: SHEET_PAGE_SIZE,
        enabled: !!teacherId,
    });

    const { mutateAsync: markDays } = useMarkDays();
    const { mutateAsync: updateMonth } = useUpdateMonth();
    const { mutateAsync: syncMonth, isPending: isSyncing } = useSync();

    const { useUpdate: useUpdateStudent } = useStudent();
    const { mutateAsync: updateStudent } = useUpdateStudent();

    const [overrides, setOverrides] = useState<
        Map<string, AttendanceStatus | null>
    >(new Map());
    const queue = useRef<Map<string, AttendanceStatus | null>>(new Map());
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flush = useCallback(async () => {
        const batch = [...queue.current.entries()];
        queue.current.clear();
        if (!batch.length) return;

        const values = batch.map(([key, status]) => {
            const [attendanceMonthId, date] = key.split(":");
            return {
                attendanceMonthId: attendanceMonthId!,
                date: date!,
                status,
            };
        });

        try {
            await markDays({ values });
            await refetch();
        } catch {
            // useMarkDays already toasts and invalidates; dropping the
            // overrides below snaps the cells back to the server truth
        } finally {
            setOverrides((prev) => {
                const next = new Map(prev);
                for (const [key] of batch) {
                    // keep cells re-marked while this batch was in flight
                    if (!queue.current.has(key)) next.delete(key);
                }
                return next;
            });
        }
    }, [markDays, refetch]);

    const flushRef = useRef(flush);
    useEffect(() => {
        flushRef.current = flush;
    }, [flush]);

    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current);
            // don't lose clicks made just before navigating away
            void flushRef.current();
        };
    }, []);

    const setCell = (
        row: AttendanceSheetRow,
        date: string,
        status: AttendanceStatus | null
    ) => {
        if (row.isLocked && !canLock) return;

        const key = cellKey(row.id, date);
        setOverrides((prev) => new Map(prev).set(key, status));
        queue.current.set(key, status);

        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), FLUSH_DELAY_MS);
    };

    const statusOf = (row: AttendanceSheetRow, date: string) => {
        const key = cellKey(row.id, date);
        if (overrides.has(key)) return overrides.get(key) ?? null;

        return row.days.find((day) => day.date === date)?.status ?? null;
    };

    const totalsOf = (row: AttendanceSheetRow) => {
        const counts = { present: 0, absent: 0, rescheduled: 0 };

        for (const day of days) {
            const status = statusOf(row, day.date);
            if (status) counts[status] += 1;
        }

        // only a delivered (P) class burns quota — A and R don't
        return {
            ...counts,
            left: Math.max(0, row.monthlyClasses - counts.present),
        };
    };

    const focusCell = (rowIndex: number, dayIndex: number) => {
        const target = document.querySelector<HTMLButtonElement>(
            `[data-cell="${rowIndex}-${dayIndex}"]`
        );
        target?.focus();
    };

    const handleCellKeys = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        row: AttendanceSheetRow,
        date: string,
        rowIndex: number,
        dayIndex: number
    ) => {
        const keyed: Record<string, AttendanceStatus | null> = {
            p: "present",
            a: "absent",
            r: "rescheduled",
            Backspace: null,
            Delete: null,
        };

        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

        if (key in keyed) {
            e.preventDefault();
            setCell(row, date, keyed[key]!);
            return;
        }

        const moves: Record<string, [number, number]> = {
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
        };

        const move = moves[e.key];
        if (!move) return;

        e.preventDefault();
        focusCell(rowIndex + move[0], dayIndex + move[1]);
    };

    /**
     * Exports the WHOLE month, not just the visible page: pending marks are
     * flushed first, then every page is refetched so the CSV is built from
     * server truth rather than local overrides.
     */
    const handleExport = async () => {
        if (!data || isExporting) return;
        setIsExporting(true);

        try {
            if (timer.current) clearTimeout(timer.current);
            await flush();

            const all: AttendanceSheetRow[] = [];
            for (let p = 1; p <= (data.pages || 1); p++) {
                const searchParams = new URLSearchParams({
                    month,
                    page: String(p),
                    limit: String(SHEET_PAGE_SIZE),
                });
                if (teacherId) searchParams.append("teacherId", teacherId);

                const res = await cFetch<AttendanceSheetData>(
                    `/api/attendance/sheet?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                all.push(...res.data.rows);
            }

            const csv = Papa.unparse(
                all.map((row, index) => {
                    const byDate = new Map(
                        row.days.map((day) => [day.date, day.status])
                    );
                    const counts = {
                        present: row.totals.present,
                        absent: row.totals.absent,
                        rescheduled: row.totals.rescheduled,
                        left: Math.max(
                            0,
                            row.monthlyClasses - row.totals.present
                        ),
                    };

                    return {
                        "Sl. No.": index + 1,
                        "Student Name": row.student.name,
                        "Student ID": displayStudentId(row.student),
                        Course: row.course.title,
                        "Academy Fee": row.academyFee,
                        "Teacher Fee": row.teacherFee,
                        "Classes / Month": row.monthlyClasses,
                        Months: row.totalMonths ?? "",
                        "Total Present": counts.present,
                        "Total Absent": counts.absent,
                        "Total Rescheduled": counts.rescheduled,
                        "Classes Left": counts.left,
                        ...Object.fromEntries(
                            days.map((day) => {
                                const status = byDate.get(day.date);
                                return [
                                    String(day.day),
                                    status
                                        ? ATTENDANCE_STATUS_LABELS[status].short
                                        : "",
                                ];
                            })
                        ),
                    };
                })
            );

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `attendance_${teacherName ? `${teacherName.replace(/\s+/g, "-").toLowerCase()}_` : ""}${month}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            handleClientError(error, null);
        } finally {
            setIsExporting(false);
        }
    };

    if (isPending) return <AttendanceSheetSkeleton />;

    const rows = data?.rows ?? [];

    const totalsByRow = new Map(rows.map((row) => [row.id, totalsOf(row)]));
    const grandTotals = [...totalsByRow.values()].reduce(
        (acc, counts) => ({
            present: acc.present + counts.present,
            absent: acc.absent + counts.absent,
            rescheduled: acc.rescheduled + counts.rescheduled,
            left: acc.left + counts.left,
        }),
        { present: 0, absent: 0, rescheduled: 0, left: 0 }
    );

    const academyFeeTotal = rows.reduce((sum, row) => sum + row.academyFee, 0);
    const teacherFeeTotal = rows.reduce((sum, row) => sum + row.teacherFee, 0);
    const classesTotal = rows.reduce((sum, row) => sum + row.monthlyClasses, 0);

    const presentOn = (date: string) =>
        rows.reduce(
            (count, row) =>
                statusOf(row, date) === "present" ? count + 1 : count,
            0
        );

    const tableMinWidth =
        COL_WIDTHS.serial +
        COL_WIDTHS.student +
        COL_WIDTHS.id +
        COL_WIDTHS.academyFee +
        COL_WIDTHS.teacherFee +
        COL_WIDTHS.classes +
        COL_WIDTHS.months +
        COL_WIDTHS.present +
        COL_WIDTHS.absent +
        COL_WIDTHS.rescheduled +
        COL_WIDTHS.left +
        (canLock ? COL_WIDTHS.lock : 0) +
        days.length * COL_WIDTHS.day;

    const isSaving = overrides.size > 0;

    return (
        <div className="space-y-4 border-t pt-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="outline"
                        className="size-9"
                        onClick={() => onMonthChange(shiftMonthKey(month, -1))}
                    >
                        <Icons.CaretLeft className="size-4" />
                        <span className="sr-only">Previous month</span>
                    </Button>

                    <MonthPicker
                        value={month}
                        onChange={onMonthChange}
                        className="h-9 w-44"
                        align="start"
                    />

                    <Button
                        size="icon"
                        variant="outline"
                        className="size-9"
                        onClick={() => onMonthChange(shiftMonthKey(month, 1))}
                    >
                        <Icons.CaretRight className="size-4" />
                        <span className="sr-only">Next month</span>
                    </Button>
                </div>

                {month !== monthKey() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMonthChange(monthKey())}
                    >
                        This month
                    </Button>
                )}

                {isSaving && (
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Icons.Spinner className="size-3.5 animate-spin" />
                        Saving...
                    </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                    <div className="text-muted-foreground hidden items-center gap-3 text-xs md:flex">
                        {ATTENDANCE_STATUSES.map((status) => (
                            <span
                                key={status}
                                className="flex items-center gap-1"
                            >
                                <span
                                    className={cn(
                                        "flex size-4 items-center justify-center rounded text-[10px] font-semibold",
                                        STATUS_STYLES[status]
                                    )}
                                >
                                    {ATTENDANCE_STATUS_LABELS[status].short}
                                </span>
                                {ATTENDANCE_STATUS_LABELS[status].label}
                            </span>
                        ))}
                    </div>

                    {canEditIdentity && teacherId && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isSyncing}
                            onClick={() => syncMonth({ month, teacherId })}
                        >
                            <Icons.ArrowsClockwise className="size-4" />
                            Sync
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={!rows.length || isExporting}
                    >
                        {isExporting ? (
                            <Icons.Spinner className="size-4 animate-spin" />
                        ) : (
                            <Icons.Download className="size-4" />
                        )}
                        Export
                    </Button>
                </div>
            </div>

            {!rows.length ? (
                <Card size="sm">
                    <CardContent className="space-y-1 py-10 text-center">
                        <p className="text-sm font-medium">
                            Nothing to mark this month
                        </p>
                        <p className="text-muted-foreground text-sm">
                            This teacher has no active enrollments covering this
                            month. Add a student, then sync the month.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-background relative max-h-[70vh] overflow-auto rounded-xl border">
                    <table
                        className="w-full table-fixed border-separate border-spacing-0 text-sm"
                        style={{ minWidth: tableMinWidth }}
                    >
                        <colgroup>
                            <col style={{ width: COL_WIDTHS.serial }} />
                            <col />
                            <col style={{ width: COL_WIDTHS.id }} />
                            <col style={{ width: COL_WIDTHS.academyFee }} />
                            <col style={{ width: COL_WIDTHS.teacherFee }} />
                            <col style={{ width: COL_WIDTHS.classes }} />
                            <col style={{ width: COL_WIDTHS.months }} />
                            <col style={{ width: COL_WIDTHS.present }} />
                            <col style={{ width: COL_WIDTHS.absent }} />
                            <col style={{ width: COL_WIDTHS.rescheduled }} />
                            <col style={{ width: COL_WIDTHS.left }} />
                            {canLock && (
                                <col style={{ width: COL_WIDTHS.lock }} />
                            )}
                            {days.map((day) => (
                                <col
                                    key={day.date}
                                    style={{ width: COL_WIDTHS.day }}
                                />
                            ))}
                        </colgroup>

                        <thead>
                            <tr>
                                <Th
                                    className="z-40 text-center"
                                    style={{ left: 0 }}
                                >
                                    #
                                </Th>
                                <Th
                                    className="z-40 border-r text-left"
                                    style={{ left: COL_WIDTHS.serial }}
                                >
                                    Student
                                </Th>
                                <Th className="text-left">ID</Th>
                                <Th
                                    className="text-right"
                                    title="Academy fee — what the student pays"
                                >
                                    Academy Fee
                                </Th>
                                <Th
                                    className="text-right"
                                    title="Teacher fee — what the academy pays the teacher"
                                >
                                    Teacher Fee
                                </Th>
                                <Th className="text-center">Classes</Th>
                                <Th className="text-center">Months</Th>
                                <Th className="text-center">Present</Th>
                                <Th className="text-center">Absent</Th>
                                <Th
                                    className="text-center"
                                    title="Rescheduled classes"
                                >
                                    Resch.
                                </Th>
                                <Th
                                    className="text-center"
                                    title="Classes left"
                                >
                                    Left
                                </Th>
                                {canLock && (
                                    <Th className="text-center">Lock</Th>
                                )}

                                {days.map((day) => (
                                    <Th
                                        key={day.date}
                                        className={cn(
                                            "px-0 text-center",
                                            day.isWeekend &&
                                                "text-muted-foreground/60"
                                        )}
                                    >
                                        <span className="block text-[10px] leading-none font-normal">
                                            {day.weekday.slice(0, 2)}
                                        </span>
                                        <span
                                            className={cn(
                                                "mt-0.5 inline-flex size-5 items-center justify-center rounded-full leading-none tabular-nums",
                                                today === day.day &&
                                                    "bg-primary text-primary-foreground font-bold"
                                            )}
                                        >
                                            {day.day}
                                        </span>
                                    </Th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, rowIndex) => {
                                const counts = totalsByRow.get(row.id)!;
                                const isReadOnly = row.isLocked && !canLock;

                                return (
                                    <tr key={row.id}>
                                        <Td
                                            className="bg-background text-muted-foreground sticky z-20 text-center text-xs tabular-nums"
                                            style={{ left: 0 }}
                                        >
                                            {(page - 1) * SHEET_PAGE_SIZE +
                                                rowIndex +
                                                1}
                                        </Td>

                                        <Td
                                            className="bg-background sticky z-20 border-r"
                                            style={{ left: COL_WIDTHS.serial }}
                                        >
                                            {canEditIdentity ? (
                                                <TextCell
                                                    value={row.student.name}
                                                    className="font-medium"
                                                    onCommit={(value) =>
                                                        updateStudent({
                                                            id: row.student.id,
                                                            values: {
                                                                name:
                                                                    value ?? "",
                                                            },
                                                            redirect: false,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <p
                                                    className="truncate font-medium"
                                                    title={row.student.name}
                                                >
                                                    {row.student.name}
                                                </p>
                                            )}

                                            <p
                                                className="text-muted-foreground truncate text-xs"
                                                title={row.course.title}
                                            >
                                                {row.course.title}
                                            </p>
                                        </Td>

                                        <Td>
                                            {canEditIdentity ? (
                                                <TextCell
                                                    value={row.student.code}
                                                    nullable
                                                    placeholder={displayStudentId(
                                                        row.student
                                                    )}
                                                    className="font-mono text-xs"
                                                    onCommit={(value) =>
                                                        updateStudent({
                                                            id: row.student.id,
                                                            values: {
                                                                code: value,
                                                            },
                                                            redirect: false,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <span
                                                    className="block truncate font-mono text-xs"
                                                    title={displayStudentId(
                                                        row.student
                                                    )}
                                                >
                                                    {displayStudentId(
                                                        row.student
                                                    )}
                                                </span>
                                            )}
                                        </Td>

                                        <Td className="text-right">
                                            <NumberCell
                                                value={row.academyFee}
                                                disabled={isReadOnly}
                                                className="text-right"
                                                onCommit={(value) =>
                                                    updateMonth({
                                                        id: row.id,
                                                        values: {
                                                            academyFee:
                                                                value ?? 0,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className="text-muted-foreground block truncate text-[10px]">
                                                {formatFeeTag(row.academyFee)}
                                            </span>
                                        </Td>

                                        <Td className="text-right">
                                            <NumberCell
                                                value={row.teacherFee}
                                                disabled={isReadOnly}
                                                className="text-right"
                                                onCommit={(value) =>
                                                    updateMonth({
                                                        id: row.id,
                                                        values: {
                                                            teacherFee:
                                                                value ?? 0,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className="text-muted-foreground block truncate text-[10px]">
                                                {formatFeeTag(row.teacherFee)}
                                            </span>
                                        </Td>

                                        <Td className="text-center">
                                            <NumberCell
                                                value={row.monthlyClasses}
                                                disabled={isReadOnly}
                                                max={31}
                                                onCommit={(value) =>
                                                    updateMonth({
                                                        id: row.id,
                                                        values: {
                                                            monthlyClasses:
                                                                value ?? 0,
                                                        },
                                                    })
                                                }
                                            />
                                        </Td>

                                        <Td className="text-center">
                                            <NumberCell
                                                value={row.totalMonths}
                                                disabled={isReadOnly}
                                                max={120}
                                                nullable
                                                placeholder="—"
                                                onCommit={(value) =>
                                                    updateMonth({
                                                        id: row.id,
                                                        values: {
                                                            totalMonths: value,
                                                        },
                                                    })
                                                }
                                            />
                                        </Td>

                                        <Td className="text-center font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                            {counts.present}
                                        </Td>

                                        <Td className="text-center font-semibold text-red-600 tabular-nums dark:text-red-400">
                                            {counts.absent}
                                        </Td>

                                        <Td className="text-center font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                                            {counts.rescheduled}
                                        </Td>

                                        <Td className="text-center font-semibold tabular-nums">
                                            {counts.left}
                                        </Td>

                                        {canLock && (
                                            <Td className="text-center">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7"
                                                    title={
                                                        row.isLocked
                                                            ? "Unlock for faculty"
                                                            : "Lock for faculty"
                                                    }
                                                    onClick={() =>
                                                        updateMonth({
                                                            id: row.id,
                                                            values: {
                                                                isLocked:
                                                                    !row.isLocked,
                                                            },
                                                        })
                                                    }
                                                >
                                                    {row.isLocked ? (
                                                        <Icons.Lock className="size-4" />
                                                    ) : (
                                                        <Icons.LockOpen className="text-muted-foreground size-4" />
                                                    )}
                                                </Button>
                                            </Td>
                                        )}

                                        {days.map((day, dayIndex) => {
                                            const status = statusOf(
                                                row,
                                                day.date
                                            );

                                            return (
                                                <Td
                                                    key={day.date}
                                                    className={cn(
                                                        "p-0.5 text-center",
                                                        day.isWeekend &&
                                                            "bg-muted/40",
                                                        today === day.day &&
                                                            "bg-primary/5"
                                                    )}
                                                >
                                                    <button
                                                        type="button"
                                                        data-cell={`${rowIndex}-${dayIndex}`}
                                                        disabled={isReadOnly}
                                                        title={
                                                            status
                                                                ? ATTENDANCE_STATUS_LABELS[
                                                                      status
                                                                  ].label
                                                                : "Not marked"
                                                        }
                                                        className={cn(
                                                            "focus-visible:ring-ring relative size-8 rounded-md text-xs font-semibold transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                                                            status
                                                                ? STATUS_STYLES[
                                                                      status
                                                                  ]
                                                                : "text-muted-foreground/40 hover:bg-muted-foreground/10"
                                                        )}
                                                        onClick={() =>
                                                            setCell(
                                                                row,
                                                                day.date,
                                                                nextStatus(
                                                                    status
                                                                )
                                                            )
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleCellKeys(
                                                                e,
                                                                row,
                                                                day.date,
                                                                rowIndex,
                                                                dayIndex
                                                            )
                                                        }
                                                    >
                                                        {status
                                                            ? ATTENDANCE_STATUS_LABELS[
                                                                  status
                                                              ].short
                                                            : "·"}
                                                    </button>
                                                </Td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>

                        <tfoot>
                            <tr>
                                <Td
                                    colSpan={2}
                                    className={cn(
                                        FOOT_CELL,
                                        "z-30 border-r text-xs font-medium"
                                    )}
                                    style={{ left: 0 }}
                                >
                                    Totals
                                </Td>
                                <Td className={FOOT_CELL} />
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-right text-xs font-medium tabular-nums"
                                    )}
                                >
                                    {formatFeeTag(academyFeeTotal)}
                                </Td>
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-right text-xs font-medium tabular-nums"
                                    )}
                                >
                                    {formatFeeTag(teacherFeeTotal)}
                                </Td>
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-muted-foreground text-center text-xs tabular-nums"
                                    )}
                                >
                                    {classesTotal}
                                </Td>
                                <Td className={FOOT_CELL} />
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-center text-xs font-semibold text-emerald-600 tabular-nums dark:text-emerald-400"
                                    )}
                                >
                                    {grandTotals.present}
                                </Td>
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-center text-xs font-semibold text-red-600 tabular-nums dark:text-red-400"
                                    )}
                                >
                                    {grandTotals.absent}
                                </Td>
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-center text-xs font-semibold text-amber-600 tabular-nums dark:text-amber-400"
                                    )}
                                >
                                    {grandTotals.rescheduled || ""}
                                </Td>
                                <Td
                                    className={cn(
                                        FOOT_CELL,
                                        "text-center text-xs font-semibold tabular-nums"
                                    )}
                                >
                                    {grandTotals.left}
                                </Td>
                                {canLock && <Td className={FOOT_CELL} />}
                                {days.map((day) => {
                                    const count = presentOn(day.date);

                                    return (
                                        <Td
                                            key={day.date}
                                            className={cn(
                                                FOOT_CELL,
                                                "text-muted-foreground text-center text-xs tabular-nums"
                                            )}
                                        >
                                            {count || ""}
                                        </Td>
                                    );
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {(data?.pages ?? 0) > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-muted-foreground text-xs">
                        {data?.count ?? 0} rows · totals below the grid cover
                        this page only
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <Icons.CaretLeft className="size-4" />
                            <span className="sr-only">Previous page</span>
                        </Button>
                        <span className="text-muted-foreground text-xs tabular-nums">
                            Page {page} of {Math.max(1, data?.pages ?? 1)}
                        </span>
                        <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                            disabled={page >= (data?.pages ?? 1)}
                            onClick={() => setPage(page + 1)}
                        >
                            <Icons.CaretRight className="size-4" />
                            <span className="sr-only">Next page</span>
                        </Button>
                    </div>
                </div>
            )}

            {!!rows.length && (
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>
                        Click a day to cycle present → absent → rescheduled →
                        clear. Keys: P, A, R, Backspace to clear, arrows to
                        move.
                    </span>

                    {canEditIdentity && (
                        <span>
                            Names, IDs, fees, classes and months are editable —
                            click a value.
                        </span>
                    )}

                    {canLock && (
                        <Badge variant="outline">
                            Locked months are read-only for faculty
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}

function Th({
    className,
    style,
    title,
    children,
}: {
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    children?: React.ReactNode;
}) {
    return (
        <th
            title={title}
            style={style}
            className={cn(
                "bg-muted text-muted-foreground sticky top-0 z-30 overflow-hidden border-b px-2 py-1.5 text-xs font-medium whitespace-nowrap",
                className
            )}
        >
            {children}
        </th>
    );
}

function Td({
    className,
    style,
    colSpan,
    children,
}: {
    className?: string;
    style?: React.CSSProperties;
    colSpan?: number;
    children?: React.ReactNode;
}) {
    return (
        <td
            colSpan={colSpan}
            style={style}
            className={cn(
                "overflow-hidden border-b px-2 py-1.5 align-middle whitespace-nowrap",
                className
            )}
        >
            {children}
        </td>
    );
}

function TextCell({
    value,
    onCommit,
    disabled,
    nullable,
    placeholder,
    className,
}: {
    value: string | null;
    onCommit: (value: string | null) => void;
    disabled?: boolean;
    nullable?: boolean;
    placeholder?: string;
    className?: string;
}) {
    const [draft, setDraft] = useState(value ?? "");
    const [committed, setCommitted] = useState(value);

    if (committed !== value) {
        setCommitted(value);
        setDraft(value ?? "");
    }

    const commit = () => {
        const trimmed = draft.trim();

        if (!trimmed) {
            if (!nullable) {
                setDraft(value ?? "");
                return;
            }
            if (value !== null) onCommit(null);
            return;
        }

        if (trimmed !== value) onCommit(trimmed);
    };

    return (
        <input
            type="text"
            value={draft}
            placeholder={placeholder}
            disabled={disabled}
            title={disabled ? undefined : "Click to edit"}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
            }}
            className={cn(
                "peer focus-visible:border-ring enabled:hover:border-input -mx-1 w-[calc(100%+0.5rem)] rounded border border-transparent bg-transparent px-1 py-0.5 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                className
            )}
        />
    );
}

function NumberCell({
    value,
    onCommit,
    disabled,
    max,
    nullable,
    placeholder,
    className,
}: {
    value: number | null;
    onCommit: (value: number | null) => void;
    disabled?: boolean;
    max?: number;
    nullable?: boolean;
    placeholder?: string;
    className?: string;
}) {
    const [draft, setDraft] = useState(value === null ? "" : String(value));
    const [committed, setCommitted] = useState(value);

    if (committed !== value) {
        setCommitted(value);
        setDraft(value === null ? "" : String(value));
    }

    const commit = () => {
        if (draft === "") {
            if (!nullable) {
                setDraft(value === null ? "" : String(value));
                return;
            }
            if (value !== null) onCommit(null);
            return;
        }

        const parsed = Number(draft);
        if (Number.isNaN(parsed) || parsed < 0) {
            setDraft(value === null ? "" : String(value));
            return;
        }

        const clamped = max !== undefined ? Math.min(parsed, max) : parsed;
        setDraft(String(clamped));
        if (clamped !== value) onCommit(clamped);
    };

    return (
        <input
            type="number"
            min={0}
            max={max}
            value={draft}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
            }}
            className={cn(
                "focus-visible:border-ring enabled:hover:border-input -mx-1 w-[calc(100%+0.5rem)] [appearance:textfield] rounded border border-transparent bg-transparent px-1 py-0.5 text-center tabular-nums focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                className
            )}
        />
    );
}
