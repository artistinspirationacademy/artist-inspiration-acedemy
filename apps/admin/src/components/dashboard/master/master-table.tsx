"use client";

import { DataTableSkeleton } from "@/components/globals/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    cFetch,
    cn,
    displayStudentId,
    enrollmentMonthOrdinal,
    formatFeeTag,
    formatMonthKey,
    handleClientError,
    Icons,
    IMPORT_MASTER_MAX_ROWS,
    ImportMasterResult,
    MASTER_CSV_HEADERS,
    MasterRow,
    MasterTable as MasterTableData,
    monthKey,
    monthKeyOf,
} from "@workspace/config";
import {
    useCourse,
    useMaster,
    usePackage,
    usePlatform,
    useTeacher,
} from "@workspace/rq";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import Papa from "papaparse";
import { useRef, useState } from "react";
import { toast } from "sonner";

/**
 * The table uses a fixed layout, so these widths are exact. The frozen-pane
 * `left` offsets are derived from the same values and can never drift out of
 * sync with the rendered columns. `student` is the only flexible column.
 */
const COL_WIDTHS = {
    serial: 40,
    student: 208,
    id: 96,
    tutor: 144,
    course: 144,
    platform: 128,
    package: 152,
    cpw: 56,
    quota: 64,
    ongoing: 80,
    academyFee: 104,
    teacherFee: 104,
    taken: 60,
    left: 56,
    packageLeft: 80,
    start: 88,
    lastMarked: 100,
    active: 60,
} as const;

const tableMinWidth = Object.values(COL_WIDTHS).reduce((a, b) => a + b, 0);

interface MasterDraft {
    name: string;
    code: string | null;
    teacherId: string | null;
    courseId: string | null;
    platformId: string | null;
    packageId: string | null;
    classesPerWeek: number;
    monthlyClasses: number;
    academyFee: number;
    teacherFee: number;
}

const EMPTY_DRAFT: MasterDraft = {
    name: "",
    code: null,
    teacherId: null,
    courseId: null,
    platformId: null,
    packageId: null,
    classesPerWeek: 1,
    monthlyClasses: 4,
    academyFee: 0,
    teacherFee: 0,
};

// the CSV contract shared by template, export and import — quota/fees fall
// back to the contract when the month has no snapshot, matching the table
function toCsvRow(row: MasterRow) {
    return {
        "Student ID": displayStudentId(row.student),
        "Student Name": row.student.name,
        Email: row.student.email ?? "",
        Phone: row.student.phone ?? "",
        "Guardian Name": row.student.guardianName ?? "",
        Notes: row.student.notes ?? "",
        Tutor: row.teacher.name,
        Course: row.course.title,
        Platform: row.platform?.name ?? "",
        Package: row.package?.name ?? "",
        "Classes/Week": row.classesPerWeek,
        "Monthly Classes":
            row.monthSnapshot?.monthlyClasses ?? row.contract.monthlyClasses,
        "Academy Fee": row.monthSnapshot?.academyFee ?? row.contract.academyFee,
        "Teacher Fee": row.monthSnapshot?.teacherFee ?? row.contract.teacherFee,
        "Total Months": row.totalMonths ?? "",
        "Start Month": monthKeyOf(row.startMonth),
        Active: row.isActive,
    };
}

function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function MasterTable() {
    const [month, setMonth] = useQueryState(
        "month",
        parseAsString.withDefault(monthKey())
    );
    const [search, setSearch] = useQueryState("search", { defaultValue: "" });
    const [teacherId, setTeacherId] = useQueryState("teacherId", parseAsString);
    const [courseId, setCourseId] = useQueryState("courseId", parseAsString);
    const [platformId, setPlatformId] = useQueryState(
        "platformId",
        parseAsString
    );
    const [packageId, setPackageId] = useQueryState("packageId", parseAsString);
    const [active, setActive] = useQueryState("active", parseAsString);
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(1)
    );
    const [limit] = useQueryState("limit", parseAsInteger.withDefault(25));

    const {
        usePaginate,
        useCreateStudent,
        useImport,
        useUpdateEnrollment,
        useUpdateStudent,
        useUpdateMonth,
    } = useMaster();

    const { data, isPending, refetch } = usePaginate({
        month,
        search,
        teacherId: teacherId ?? undefined,
        courseId: courseId ?? undefined,
        platformId: platformId ?? undefined,
        packageId: packageId ?? undefined,
        isActive: active === null ? undefined : active === "true",
        limit,
        page,
    });

    const { mutateAsync: createStudent, isPending: isCreating } =
        useCreateStudent();
    const { mutateAsync: importRows, isPending: isImporting } = useImport();
    const { mutateAsync: updateEnrollment } = useUpdateEnrollment();
    const { mutateAsync: updateStudent } = useUpdateStudent();
    const { mutateAsync: updateMonth } = useUpdateMonth();

    const { data: teachers = [] } = useTeacher().useScan({});
    const { data: courses = [] } = useCourse().useScan({});
    const { data: platforms = [] } = usePlatform().useScan({});
    const { data: packages = [] } = usePackage().useScan({});

    // optimistic overrides keyed `${enrollmentId}:${field}` — the same
    // flush/rollback pattern as the attendance sheet: apply immediately,
    // drop on settle so a failed write snaps back to server truth
    const [overrides, setOverrides] = useState<Map<string, unknown>>(new Map());

    const commit = async (
        key: string,
        value: unknown,
        run: () => Promise<unknown>
    ) => {
        setOverrides((prev) => new Map(prev).set(key, value));

        try {
            await run();
            await refetch();
        } catch {
            // the mutation hook already toasts and invalidates
        } finally {
            setOverrides((prev) => {
                const next = new Map(prev);
                next.delete(key);
                return next;
            });
        }
    };

    function ov<T>(row: MasterRow, field: string, fallback: T): T {
        const key = `${row.enrollmentId}:${field}`;
        return overrides.has(key) ? (overrides.get(key) as T) : fallback;
    }

    function resetPageAnd<T>(setter: (value: T) => void) {
        return (value: T) => {
            setter(value);
            setPage(1);
        };
    }

    // inline "new student" draft row — saved as one student + one enrollment
    // starting in the shown month, so the row appears in place after saving
    const [draft, setDraft] = useState<MasterDraft | null>(null);

    const patchDraft = (patch: Partial<MasterDraft>) =>
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

    const saveDraft = async () => {
        if (!draft || isCreating) return;

        if (!draft.name.trim() || !draft.teacherId || !draft.courseId) {
            toast.error("A name, tutor and course are required");
            return;
        }

        try {
            await createStudent({
                name: draft.name.trim(),
                code: draft.code,
                email: null,
                phone: null,
                guardianName: null,
                notes: null,
                isActive: true,
                enrollments: [
                    {
                        teacherId: draft.teacherId,
                        courseId: draft.courseId,
                        platformId: draft.platformId,
                        packageId: draft.packageId,
                        academyFee: draft.academyFee,
                        teacherFee: draft.teacherFee,
                        monthlyClasses: draft.monthlyClasses,
                        classesPerWeek: draft.classesPerWeek,
                        totalMonths: null,
                        startMonth: month,
                        isActive: true,
                    },
                ],
            });
            setDraft(null);
            await refetch();
        } catch {
            // the hook already toasts; keep the draft so nothing typed is lost
        }
    };

    // import / export / template — all three share the MASTER_CSV_HEADERS
    // contract, so an unmodified export re-imports as pure updates
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportMasterResult | null>(
        null
    );

    // the example rows each teach one shape: every column filled, a second
    // enrollment on the same ID, the bare minimum with optional columns
    // blank, and an inactive fixed-term plan
    const handleTemplate = () => {
        const csv = Papa.unparse({
            fields: [...MASTER_CSV_HEADERS],
            data: [
                // fully filled — fixed-term plan (6 months) with a package
                // prettier-ignore
                ["AIA-H-001", "Asha Rao", "asha@example.com", "9876543210", "Ravi Rao", "Prefers weekend evenings", "John Doe", "Hindusthani", "AIA", "Starter 12", 2, 8, 2400, 1500, 6, month, true],
                // same Student ID again = a second course for the same
                // student; repeat the student columns unchanged
                // prettier-ignore
                ["AIA-H-001", "Asha Rao", "asha@example.com", "9876543210", "Ravi Rao", "Prefers weekend evenings", "Adam Smith", "Piano", "AIA", "", 1, 4, 2000, 1200, "", month, true],
                // bare minimum — email/phone/guardian/notes/platform/package
                // may stay blank; blank Total Months = ongoing
                // prettier-ignore
                ["AIA-V-002", "Rahul Mehta", "", "", "", "", "John Doe", "Hindusthani", "", "", 1, 4, 1600, 1000, "", month, true],
                // Active false pauses the enrollment without deleting it
                // prettier-ignore
                ["AIA-V-003", "Diya Sharma", "diya@example.com", "9812345678", "", "", "Adam Smith", "Piano", "Urban Pro", "Quarterly 36", 1, 4, 1800, 1100, 3, month, false],
            ],
        });
        downloadCsv(csv, "master_template.csv");
    };

    // exports every page matching the current filters + month, not just the
    // visible one — the attendance sheet's page-looping export pattern
    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            const all: MasterRow[] = [];
            let totalPages = 1;

            for (let p = 1; p <= totalPages; p++) {
                const searchParams = new URLSearchParams({
                    month,
                    page: String(p),
                    limit: "100",
                });
                if (search) searchParams.append("search", search);
                if (teacherId) searchParams.append("teacherId", teacherId);
                if (courseId) searchParams.append("courseId", courseId);
                if (platformId) searchParams.append("platformId", platformId);
                if (packageId) searchParams.append("packageId", packageId);
                if (active !== null) searchParams.append("isActive", active);

                const res = await cFetch<MasterTableData>(
                    `/api/master?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;

                totalPages = res.data.pages || 1;
                all.push(...res.data.data);
            }

            downloadCsv(
                Papa.unparse(all.map(toCsvRow), {
                    columns: [...MASTER_CSV_HEADERS],
                }),
                `master_${month}.csv`
            );
        } catch (error) {
            handleClientError(error, null);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportFile = (file: File) => {
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: async ({ data: parsedRows }) => {
                if (!parsedRows.length) {
                    toast.error("The file has no data rows");
                    return;
                }
                if (parsedRows.length > IMPORT_MASTER_MAX_ROWS) {
                    toast.error(
                        `Import at most ${IMPORT_MASTER_MAX_ROWS} rows at a time`
                    );
                    return;
                }

                try {
                    const result = await importRows({
                        month,
                        rows: parsedRows,
                    });
                    if (result.results.some((r) => r.error))
                        setImportResult(result);
                } catch {
                    // the hook already toasts
                }
            },
            error: () => toast.error("Could not read the CSV file"),
        });
    };

    const rows = data?.data ?? [];
    const pages = data?.pages ?? 0;
    const isSaving = overrides.size > 0;
    const importErrors =
        importResult?.results.filter((result) => result.error) ?? [];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <MonthPicker
                    value={month}
                    onChange={(next) => setMonth(next)}
                    className="h-9 w-44"
                    align="start"
                />

                {month !== monthKey() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMonth(monthKey())}
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

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Input
                        value={search}
                        placeholder="Search by name or ID..."
                        className="h-9 w-56"
                        onChange={(e) =>
                            resetPageAnd(setSearch)(e.target.value)
                        }
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleImportFile(file);
                        }}
                    />

                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        title="Download an empty import template"
                        onClick={handleTemplate}
                    >
                        <Icons.FileText className="size-4" />
                        Template
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        title="Import a CSV — rows update or create students, never delete"
                        disabled={isImporting}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Icons.Upload className="size-4" />
                        Import
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        title="Export every row matching the current filters"
                        disabled={isExporting}
                        onClick={handleExport}
                    >
                        {isExporting ? (
                            <Icons.Spinner className="size-4 animate-spin" />
                        ) : (
                            <Icons.Download className="size-4" />
                        )}
                        Export
                    </Button>

                    <Button
                        size="sm"
                        className="h-9"
                        disabled={!!draft}
                        onClick={() => setDraft(EMPTY_DRAFT)}
                    >
                        <Icons.Plus className="size-4" />
                        Add student
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                    placeholder="All tutors"
                    value={teacherId}
                    options={teachers.map((t) => ({
                        value: t.id,
                        label: t.name,
                    }))}
                    onChange={resetPageAnd(setTeacherId)}
                />
                <FilterSelect
                    placeholder="All courses"
                    value={courseId}
                    options={courses.map((c) => ({
                        value: c.id,
                        label: c.title,
                    }))}
                    onChange={resetPageAnd(setCourseId)}
                />
                <FilterSelect
                    placeholder="All platforms"
                    value={platformId}
                    options={platforms.map((p) => ({
                        value: p.id,
                        label: p.name,
                    }))}
                    onChange={resetPageAnd(setPlatformId)}
                />
                <FilterSelect
                    placeholder="All packages"
                    value={packageId}
                    options={packages.map((p) => ({
                        value: p.id,
                        label: p.name,
                    }))}
                    onChange={resetPageAnd(setPackageId)}
                />
                <FilterSelect
                    placeholder="Active + inactive"
                    value={active}
                    options={[
                        { value: "true", label: "Active only" },
                        { value: "false", label: "Inactive only" },
                    ]}
                    onChange={resetPageAnd(setActive)}
                />
            </div>

            {isPending ? (
                <DataTableSkeleton columnCount={10} pageSize={limit} />
            ) : !rows.length && !draft ? (
                <Card size="sm">
                    <CardContent className="space-y-1 py-10 text-center">
                        <p className="text-sm font-medium">
                            No enrollments found
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Adjust the filters, or use “Add student” to create
                            one right here.
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
                            <col style={{ width: COL_WIDTHS.tutor }} />
                            <col style={{ width: COL_WIDTHS.course }} />
                            <col style={{ width: COL_WIDTHS.platform }} />
                            <col style={{ width: COL_WIDTHS.package }} />
                            <col style={{ width: COL_WIDTHS.cpw }} />
                            <col style={{ width: COL_WIDTHS.quota }} />
                            <col style={{ width: COL_WIDTHS.ongoing }} />
                            <col style={{ width: COL_WIDTHS.academyFee }} />
                            <col style={{ width: COL_WIDTHS.teacherFee }} />
                            <col style={{ width: COL_WIDTHS.taken }} />
                            <col style={{ width: COL_WIDTHS.left }} />
                            <col style={{ width: COL_WIDTHS.packageLeft }} />
                            <col style={{ width: COL_WIDTHS.start }} />
                            <col style={{ width: COL_WIDTHS.lastMarked }} />
                            <col style={{ width: COL_WIDTHS.active }} />
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
                                <Th className="text-left">Tutor</Th>
                                <Th className="text-left">Course</Th>
                                <Th className="text-left">Platform</Th>
                                <Th className="text-left">Package</Th>
                                <Th
                                    className="text-center"
                                    title="Classes per week (contract)"
                                >
                                    C/W
                                </Th>
                                <Th
                                    className="text-center"
                                    title="Monthly class quota for the shown month"
                                >
                                    C/M
                                </Th>
                                <Th
                                    className="text-center"
                                    title="Which month of the plan the student is in"
                                >
                                    Ongoing
                                </Th>
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
                                <Th
                                    className="text-center"
                                    title="Classes taken (present) this month"
                                >
                                    Taken
                                </Th>
                                <Th
                                    className="text-center"
                                    title="Classes left"
                                >
                                    Left/M
                                </Th>
                                <Th
                                    className="text-center"
                                    title="Package classes left / package total (lifetime)"
                                >
                                    Left/T
                                </Th>
                                <Th className="text-left">Start</Th>
                                <Th
                                    className="text-left"
                                    title="Last marked day"
                                >
                                    Last Marked
                                </Th>
                                <Th className="text-center">Active</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {draft && (
                                <tr className="bg-primary/5">
                                    <Td
                                        className="bg-background text-muted-foreground sticky z-20 text-center text-xs"
                                        style={{ left: 0 }}
                                    >
                                        <Icons.Plus className="inline size-3.5" />
                                    </Td>

                                    <Td
                                        className="bg-background sticky z-20 border-r"
                                        style={{ left: COL_WIDTHS.serial }}
                                    >
                                        <TextCell
                                            value={draft.name}
                                            placeholder="New student name"
                                            className="font-medium"
                                            nullable
                                            onCommit={(value) =>
                                                patchDraft({
                                                    name: value ?? "",
                                                })
                                            }
                                        />
                                        <p className="text-muted-foreground truncate text-xs">
                                            Joins the {formatMonthKey(month)}{" "}
                                            sheet on save
                                        </p>
                                    </Td>

                                    <Td>
                                        <TextCell
                                            value={draft.code}
                                            nullable
                                            placeholder="Auto"
                                            className="font-mono text-xs"
                                            onCommit={(value) =>
                                                patchDraft({ code: value })
                                            }
                                        />
                                    </Td>

                                    <Td>
                                        <SelectCell
                                            value={draft.teacherId}
                                            options={teachers.map((t) => ({
                                                value: t.id,
                                                label: t.name,
                                            }))}
                                            onCommit={(value) =>
                                                patchDraft({
                                                    teacherId: value,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td>
                                        <SelectCell
                                            value={draft.courseId}
                                            options={courses.map((c) => ({
                                                value: c.id,
                                                label: c.title,
                                            }))}
                                            onCommit={(value) =>
                                                patchDraft({
                                                    courseId: value,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td>
                                        <SelectCell
                                            value={draft.platformId}
                                            options={platforms.map((p) => ({
                                                value: p.id,
                                                label: p.name,
                                            }))}
                                            nullable
                                            onCommit={(value) =>
                                                patchDraft({
                                                    platformId: value,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td>
                                        <SelectCell
                                            value={draft.packageId}
                                            options={packages.map((p) => ({
                                                value: p.id,
                                                label: `${p.name} (${p.totalClasses})`,
                                            }))}
                                            nullable
                                            onCommit={(value) =>
                                                patchDraft({
                                                    packageId: value,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td className="text-center">
                                        <NumberCell
                                            value={draft.classesPerWeek}
                                            max={7}
                                            onCommit={(value) =>
                                                patchDraft({
                                                    classesPerWeek: value ?? 0,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td className="text-center">
                                        <NumberCell
                                            value={draft.monthlyClasses}
                                            max={31}
                                            onCommit={(value) =>
                                                patchDraft({
                                                    monthlyClasses: value ?? 0,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td className="text-center">
                                        <Dash />
                                    </Td>

                                    <Td className="text-right">
                                        <NumberCell
                                            value={draft.academyFee}
                                            className="text-right"
                                            onCommit={(value) =>
                                                patchDraft({
                                                    academyFee: value ?? 0,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td className="text-right">
                                        <NumberCell
                                            value={draft.teacherFee}
                                            className="text-right"
                                            onCommit={(value) =>
                                                patchDraft({
                                                    teacherFee: value ?? 0,
                                                })
                                            }
                                        />
                                    </Td>

                                    <Td className="text-center">
                                        <Dash />
                                    </Td>
                                    <Td className="text-center">
                                        <Dash />
                                    </Td>
                                    <Td className="text-center">
                                        <Dash />
                                    </Td>

                                    <Td className="text-muted-foreground text-xs whitespace-nowrap">
                                        {formatMonthKey(month)}
                                    </Td>

                                    <Td className="text-muted-foreground font-mono text-xs">
                                        —
                                    </Td>

                                    <Td className="p-0.5 text-center">
                                        <div className="flex items-center justify-center gap-0.5">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-6"
                                                title="Save student"
                                                disabled={isCreating}
                                                onClick={saveDraft}
                                            >
                                                <Icons.Check className="size-3.5" />
                                                <span className="sr-only">
                                                    Save student
                                                </span>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-6"
                                                title="Discard"
                                                disabled={isCreating}
                                                onClick={() => setDraft(null)}
                                            >
                                                <Icons.Close className="size-3.5" />
                                                <span className="sr-only">
                                                    Discard
                                                </span>
                                            </Button>
                                        </div>
                                    </Td>
                                </tr>
                            )}

                            {rows.map((row, rowIndex) => {
                                const quota = row.monthSnapshot
                                    ? ov(
                                          row,
                                          "monthlyClasses",
                                          row.monthSnapshot.monthlyClasses
                                      )
                                    : null;
                                const taken = row.presentMonth;
                                const left =
                                    quota === null
                                        ? null
                                        : Math.max(0, quota - taken);
                                const packageLeft = row.package
                                    ? Math.max(
                                          0,
                                          row.package.totalClasses -
                                              row.presentAllTime
                                      )
                                    : null;
                                const ordinal = enrollmentMonthOrdinal({
                                    month,
                                    startMonth: row.startMonth,
                                    totalMonths: row.totalMonths,
                                });

                                return (
                                    <tr key={row.enrollmentId}>
                                        <Td
                                            className="bg-background text-muted-foreground sticky z-20 text-center text-xs tabular-nums"
                                            style={{ left: 0 }}
                                        >
                                            {(page - 1) * limit + rowIndex + 1}
                                        </Td>

                                        <Td
                                            className="bg-background sticky z-20 border-r"
                                            style={{ left: COL_WIDTHS.serial }}
                                        >
                                            <TextCell
                                                value={ov(
                                                    row,
                                                    "name",
                                                    row.student.name
                                                )}
                                                className="font-medium"
                                                onCommit={(value) =>
                                                    commit(
                                                        `${row.enrollmentId}:name`,
                                                        value,
                                                        () =>
                                                            updateStudent({
                                                                id: row.student
                                                                    .id,
                                                                values: {
                                                                    name:
                                                                        value ??
                                                                        "",
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                            <p className="text-muted-foreground truncate text-xs">
                                                {[
                                                    row.student.phone,
                                                    row.student.email,
                                                    row.student.isActive
                                                        ? null
                                                        : "student inactive",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ") || "—"}
                                            </p>
                                        </Td>

                                        <Td>
                                            <TextCell
                                                value={ov(
                                                    row,
                                                    "code",
                                                    row.student.code
                                                )}
                                                nullable
                                                placeholder={displayStudentId(
                                                    row.student
                                                )}
                                                className="font-mono text-xs"
                                                onCommit={(value) =>
                                                    commit(
                                                        `${row.enrollmentId}:code`,
                                                        value,
                                                        () =>
                                                            updateStudent({
                                                                id: row.student
                                                                    .id,
                                                                values: {
                                                                    code: value,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>

                                        <Td>
                                            <SelectCell
                                                value={ov(
                                                    row,
                                                    "teacherId",
                                                    row.teacher.id
                                                )}
                                                options={teachers.map((t) => ({
                                                    value: t.id,
                                                    label: t.name,
                                                }))}
                                                onCommit={(value) =>
                                                    value &&
                                                    commit(
                                                        `${row.enrollmentId}:teacherId`,
                                                        value,
                                                        () =>
                                                            updateEnrollment({
                                                                id: row.enrollmentId,
                                                                values: {
                                                                    teacherId:
                                                                        value,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>

                                        <Td>
                                            <SelectCell
                                                value={ov(
                                                    row,
                                                    "courseId",
                                                    row.course.id
                                                )}
                                                options={courses.map((c) => ({
                                                    value: c.id,
                                                    label: c.title,
                                                }))}
                                                onCommit={(value) =>
                                                    value &&
                                                    commit(
                                                        `${row.enrollmentId}:courseId`,
                                                        value,
                                                        () =>
                                                            updateEnrollment({
                                                                id: row.enrollmentId,
                                                                values: {
                                                                    courseId:
                                                                        value,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>

                                        <Td>
                                            <SelectCell
                                                value={ov(
                                                    row,
                                                    "platformId",
                                                    row.platform?.id ?? null
                                                )}
                                                options={platforms.map((p) => ({
                                                    value: p.id,
                                                    label: p.name,
                                                }))}
                                                nullable
                                                onCommit={(value) =>
                                                    commit(
                                                        `${row.enrollmentId}:platformId`,
                                                        value,
                                                        () =>
                                                            updateEnrollment({
                                                                id: row.enrollmentId,
                                                                values: {
                                                                    platformId:
                                                                        value,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>

                                        <Td>
                                            <SelectCell
                                                value={ov(
                                                    row,
                                                    "packageId",
                                                    row.package?.id ?? null
                                                )}
                                                options={packages.map((p) => ({
                                                    value: p.id,
                                                    label: `${p.name} (${p.totalClasses})`,
                                                }))}
                                                nullable
                                                onCommit={(value) =>
                                                    commit(
                                                        `${row.enrollmentId}:packageId`,
                                                        value,
                                                        () =>
                                                            updateEnrollment({
                                                                id: row.enrollmentId,
                                                                values: {
                                                                    packageId:
                                                                        value,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>

                                        <Td className="text-center">
                                            <NumberCell
                                                value={ov(
                                                    row,
                                                    "classesPerWeek",
                                                    row.classesPerWeek
                                                )}
                                                max={7}
                                                onCommit={(value) =>
                                                    commit(
                                                        `${row.enrollmentId}:classesPerWeek`,
                                                        value ?? 0,
                                                        () =>
                                                            updateEnrollment({
                                                                id: row.enrollmentId,
                                                                values: {
                                                                    classesPerWeek:
                                                                        value ??
                                                                        0,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>

                                        <Td className="text-center">
                                            {row.monthSnapshot ? (
                                                <NumberCell
                                                    value={quota}
                                                    max={31}
                                                    onCommit={(value) =>
                                                        commit(
                                                            `${row.enrollmentId}:monthlyClasses`,
                                                            value ?? 0,
                                                            () =>
                                                                updateMonth({
                                                                    id: row
                                                                        .monthSnapshot!
                                                                        .id,
                                                                    values: {
                                                                        monthlyClasses:
                                                                            value ??
                                                                            0,
                                                                    },
                                                                })
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Dash />
                                            )}
                                        </Td>

                                        <Td className="text-muted-foreground text-center text-xs tabular-nums">
                                            {ordinal === null
                                                ? "—"
                                                : row.totalMonths
                                                  ? `${ordinal} of ${row.totalMonths}`
                                                  : ordinal}
                                        </Td>

                                        <Td className="text-right">
                                            {row.monthSnapshot ? (
                                                <>
                                                    <NumberCell
                                                        value={ov(
                                                            row,
                                                            "academyFee",
                                                            row.monthSnapshot
                                                                .academyFee
                                                        )}
                                                        className="text-right"
                                                        onCommit={(value) =>
                                                            commit(
                                                                `${row.enrollmentId}:academyFee`,
                                                                value ?? 0,
                                                                () =>
                                                                    updateMonth(
                                                                        {
                                                                            id: row
                                                                                .monthSnapshot!
                                                                                .id,
                                                                            values: {
                                                                                academyFee:
                                                                                    value ??
                                                                                    0,
                                                                            },
                                                                        }
                                                                    )
                                                            )
                                                        }
                                                    />
                                                    <span className="text-muted-foreground block truncate text-[10px]">
                                                        {formatFeeTag(
                                                            ov(
                                                                row,
                                                                "academyFee",
                                                                row
                                                                    .monthSnapshot
                                                                    .academyFee
                                                            )
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <Dash />
                                            )}
                                        </Td>

                                        <Td className="text-right">
                                            {row.monthSnapshot ? (
                                                <>
                                                    <NumberCell
                                                        value={ov(
                                                            row,
                                                            "teacherFee",
                                                            row.monthSnapshot
                                                                .teacherFee
                                                        )}
                                                        className="text-right"
                                                        onCommit={(value) =>
                                                            commit(
                                                                `${row.enrollmentId}:teacherFee`,
                                                                value ?? 0,
                                                                () =>
                                                                    updateMonth(
                                                                        {
                                                                            id: row
                                                                                .monthSnapshot!
                                                                                .id,
                                                                            values: {
                                                                                teacherFee:
                                                                                    value ??
                                                                                    0,
                                                                            },
                                                                        }
                                                                    )
                                                            )
                                                        }
                                                    />
                                                    <span className="text-muted-foreground block truncate text-[10px]">
                                                        {formatFeeTag(
                                                            ov(
                                                                row,
                                                                "teacherFee",
                                                                row
                                                                    .monthSnapshot
                                                                    .teacherFee
                                                            )
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <Dash />
                                            )}
                                        </Td>

                                        <Td className="text-center font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                            {taken}
                                        </Td>

                                        <Td className="text-center font-semibold tabular-nums">
                                            {left ?? "—"}
                                        </Td>

                                        <Td
                                            className="text-center tabular-nums"
                                            title={
                                                row.package
                                                    ? `${row.package.name}: ${packageLeft} of ${row.package.totalClasses} classes left`
                                                    : undefined
                                            }
                                        >
                                            {row.package &&
                                            packageLeft !== null ? (
                                                <>
                                                    <span className="font-semibold">
                                                        {packageLeft}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {" / "}
                                                        {
                                                            row.package
                                                                .totalClasses
                                                        }
                                                    </span>
                                                </>
                                            ) : (
                                                <Dash />
                                            )}
                                        </Td>

                                        <Td className="text-muted-foreground text-xs whitespace-nowrap">
                                            {formatMonthKey(
                                                monthKeyOf(row.startMonth)
                                            )}
                                        </Td>

                                        <Td className="text-muted-foreground font-mono text-xs">
                                            {row.lastMarked ?? "—"}
                                        </Td>

                                        <Td className="text-center">
                                            <Switch
                                                checked={ov(
                                                    row,
                                                    "isActive",
                                                    row.isActive
                                                )}
                                                onCheckedChange={(checked) =>
                                                    commit(
                                                        `${row.enrollmentId}:isActive`,
                                                        checked,
                                                        () =>
                                                            updateEnrollment({
                                                                id: row.enrollmentId,
                                                                values: {
                                                                    isActive:
                                                                        checked,
                                                                },
                                                            })
                                                    )
                                                }
                                            />
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!isPending && !!rows.length && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-muted-foreground text-xs">
                        {data?.count ?? 0} enrollment(s) ·{" "}
                        {formatMonthKey(month)} · one row per student × tutor ×
                        course
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
                            Page {page} of {Math.max(1, pages)}
                        </span>
                        <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                            disabled={page >= pages}
                            onClick={() => setPage(page + 1)}
                        >
                            <Icons.CaretRight className="size-4" />
                            <span className="sr-only">Next page</span>
                        </Button>
                    </div>
                </div>
            )}

            <Dialog
                open={!!importResult}
                onOpenChange={(open) => !open && setImportResult(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import finished with errors</DialogTitle>
                        <DialogDescription>
                            {importResult?.updated ?? 0} updated ·{" "}
                            {importResult?.created ?? 0} created ·{" "}
                            {importErrors.length} row(s) skipped. Fix the rows
                            below and import the file again — already-applied
                            rows simply update in place.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-72 space-y-2 overflow-y-auto">
                        {importErrors.map((result) => (
                            <div
                                key={result.row}
                                className="rounded-md border p-2.5 text-sm"
                            >
                                <p className="font-medium">
                                    Row {result.row}
                                    {result.id && (
                                        <span className="text-muted-foreground font-normal">
                                            {" "}
                                            · {result.id}
                                        </span>
                                    )}
                                </p>
                                <p className="text-destructive text-xs">
                                    {result.error}
                                </p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function FilterSelect({
    value,
    options,
    placeholder,
    onChange,
}: {
    value: string | null;
    options: { value: string; label: string }[];
    placeholder: string;
    onChange: (value: string | null) => void;
}) {
    return (
        <Select
            value={value ?? "all"}
            onValueChange={(next) => onChange(next === "all" ? null : next)}
        >
            <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{placeholder}</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function SelectCell({
    value,
    options,
    nullable,
    onCommit,
}: {
    value: string | null;
    options: { value: string; label: string }[];
    nullable?: boolean;
    onCommit: (value: string | null) => void;
}) {
    return (
        <Select
            value={value ?? "none"}
            onValueChange={(next) => {
                const parsed = next === "none" ? null : next;
                if (parsed !== value) onCommit(parsed);
            }}
        >
            <SelectTrigger className="hover:border-input h-7 w-full border-transparent px-1 text-xs shadow-none">
                <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
                {nullable && <SelectItem value="none">—</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function Dash() {
    return <span className="text-muted-foreground/50">—</span>;
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
    title,
    children,
}: {
    className?: string;
    style?: React.CSSProperties;
    colSpan?: number;
    title?: string;
    children?: React.ReactNode;
}) {
    return (
        <td
            colSpan={colSpan}
            style={style}
            title={title}
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
