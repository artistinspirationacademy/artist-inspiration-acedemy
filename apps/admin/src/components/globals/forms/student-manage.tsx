"use client";
"use no memo";

import { StudentFormSkeleton } from "@/components/globals/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormFooterBar } from "@/components/ui/form-footer-bar";
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
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Course,
    CreateStudent,
    createStudentSchema,
    displayStudentId,
    formatEnrollmentWindow,
    FullCourseCategory,
    FullStudent,
    Icons,
    monthKey,
    updateStudentSchema,
} from "@workspace/config";
import {
    useCourseCategory,
    usePackage,
    usePlatform,
    useStudent,
    useTeacher,
} from "@workspace/rq";
import { redirect, useParams, useRouter } from "next/navigation";
import {
    useFieldArray,
    useForm,
    useWatch,
    type Control,
    type Resolver,
} from "react-hook-form";

interface PageProps {
    data?: FullStudent;
}

export function StudentFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useStudent();
    const { data, isPending } = useGet<FullStudent>({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <StudentManageForm />;

    if (!id || typeof id !== "string") redirect("/students");
    if (isPending) return <StudentFormSkeleton />;
    if (!data) redirect("/students");

    return <StudentManageForm data={data} />;
}

export function StudentManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const { useScan: useTeacherScan } = useTeacher();
    const { data: teachers = [], isPending: isTeachersPending } =
        useTeacherScan({});

    const { useScan: useCourseCategoryScan } = useCourseCategory();
    const { data: categories = [], isPending: isCoursesPending } =
        useCourseCategoryScan<FullCourseCategory[]>({ include: "courses" });

    const { data: platforms = [], isPending: isPlatformsPending } =
        usePlatform().useScan({ isActive: true });
    const { data: packages = [], isPending: isPackagesPending } =
        usePackage().useScan({ isActive: true });

    const form = useForm<CreateStudent>({
        resolver: zodResolver(
            createStudentSchema
        ) as unknown as Resolver<CreateStudent>,
        defaultValues: {
            name: data?.name ?? "",
            code: data?.code ?? null,
            email: data?.email ?? null,
            phone: data?.phone ?? null,
            guardianName: data?.guardianName ?? null,
            notes: data?.notes ?? null,
            isActive: data?.isActive ?? true,
            enrollments: data?.enrollments.length
                ? data.enrollments.map((enrollment) => ({
                      teacherId: enrollment.teacherId,
                      courseId: enrollment.courseId,
                      platformId: enrollment.platformId,
                      packageId: enrollment.packageId,
                      academyFee: enrollment.academyFee,
                      teacherFee: enrollment.teacherFee,
                      monthlyClasses: enrollment.monthlyClasses,
                      classesPerWeek: enrollment.classesPerWeek,
                      totalMonths: enrollment.totalMonths,
                      startMonth: enrollment.startMonth.slice(0, 7),
                      isActive: enrollment.isActive,
                  }))
                : [
                      {
                          teacherId: "",
                          courseId: "",
                          platformId: null,
                          packageId: null,
                          academyFee: 0,
                          teacherFee: 0,
                          monthlyClasses: 4,
                          classesPerWeek: 1,
                          totalMonths: null,
                          startMonth: monthKey(),
                          isActive: true,
                      },
                  ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "enrollments",
    });

    const { useCreate, useUpdate } = useStudent();
    const { mutateAsync: createStudent, isPending: isCreating } = useCreate();
    const { mutateAsync: updateStudent, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;
    const courses = categories.flatMap((category) => category.courses ?? []);

    const handleSubmit = async (values: CreateStudent) => {
        if (isEdit && data)
            await updateStudent({
                id: data.id,
                values: updateStudentSchema.parse(values),
            });
        else await createStudent([values]);
    };

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Details</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid items-start gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter student name"
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Custom Student ID
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={
                                                            data
                                                                ? displayStudentId(
                                                                      data
                                                                  )
                                                                : "Auto-assigned"
                                                        }
                                                        value={
                                                            field.value ?? ""
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave empty to use the
                                                    auto-assigned ID.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid items-start gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="+91 90000 00000"
                                                        value={
                                                            field.value ?? ""
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="student@example.com"
                                                        value={
                                                            field.value ?? ""
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    For records only — students
                                                    cannot sign in.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="guardianName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Guardian Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Parent or guardian"
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <AutosizeTextarea
                                                    placeholder="Anything the team should know about this student..."
                                                    rows={3}
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between gap-2">
                                <div>
                                    <CardTitle>Enrollments</CardTitle>
                                    <p className="text-muted-foreground text-xs">
                                        Which teacher and course, and the terms
                                        used to seed each month&apos;s sheet.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isSubmitting}
                                    onClick={() =>
                                        append({
                                            teacherId: "",
                                            courseId: "",
                                            platformId: null,
                                            packageId: null,
                                            academyFee: 0,
                                            teacherFee: 0,
                                            monthlyClasses: 4,
                                            classesPerWeek: 1,
                                            totalMonths: null,
                                            startMonth: monthKey(),
                                            isActive: true,
                                        })
                                    }
                                >
                                    <Icons.Plus className="size-4" />
                                    Add
                                </Button>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {fields.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="space-y-4 rounded-md border p-4"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-medium">
                                                Enrollment {index + 1}
                                            </p>

                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    disabled={isSubmitting}
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                >
                                                    <Icons.Trash className="size-4" />
                                                    <span className="sr-only">
                                                        Remove enrollment
                                                    </span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid items-start gap-4 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.teacherId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Teacher
                                                        </FormLabel>
                                                        <Select
                                                            value={
                                                                field.value ||
                                                                undefined
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            disabled={
                                                                isSubmitting ||
                                                                isTeachersPending
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select a teacher" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                {teachers.map(
                                                                    (
                                                                        teacher
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                teacher.id
                                                                            }
                                                                            value={
                                                                                teacher.id
                                                                            }
                                                                        >
                                                                            {
                                                                                teacher.name
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.courseId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Course
                                                        </FormLabel>
                                                        <Select
                                                            value={
                                                                field.value ||
                                                                undefined
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            disabled={
                                                                isSubmitting ||
                                                                isCoursesPending
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select a course" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                {courses.map(
                                                                    (
                                                                        course: Course
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                course.id
                                                                            }
                                                                            value={
                                                                                course.id
                                                                            }
                                                                        >
                                                                            {
                                                                                course.title
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.platformId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Platform
                                                        </FormLabel>
                                                        <Select
                                                            value={
                                                                field.value ??
                                                                "none"
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                field.onChange(
                                                                    value ===
                                                                        "none"
                                                                        ? null
                                                                        : value
                                                                )
                                                            }
                                                            disabled={
                                                                isSubmitting ||
                                                                isPlatformsPending
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="None" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    None
                                                                </SelectItem>
                                                                {platforms.map(
                                                                    (
                                                                        platform
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                platform.id
                                                                            }
                                                                            value={
                                                                                platform.id
                                                                            }
                                                                        >
                                                                            {
                                                                                platform.name
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.packageId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Package
                                                        </FormLabel>
                                                        <Select
                                                            value={
                                                                field.value ??
                                                                "none"
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                field.onChange(
                                                                    value ===
                                                                        "none"
                                                                        ? null
                                                                        : value
                                                                )
                                                            }
                                                            disabled={
                                                                isSubmitting ||
                                                                isPackagesPending
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="None" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    None
                                                                </SelectItem>
                                                                {packages.map(
                                                                    (pkg) => (
                                                                        <SelectItem
                                                                            key={
                                                                                pkg.id
                                                                            }
                                                                            value={
                                                                                pkg.id
                                                                            }
                                                                        >
                                                                            {
                                                                                pkg.name
                                                                            }{" "}
                                                                            (
                                                                            {
                                                                                pkg.totalClasses
                                                                            }{" "}
                                                                            classes)
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            Optional lifetime
                                                            class total.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.academyFee`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Academy Fee
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step="0.01"
                                                                value={
                                                                    field.value ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value ===
                                                                            ""
                                                                            ? 0
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                    )
                                                                }
                                                                onBlur={
                                                                    field.onBlur
                                                                }
                                                                name={
                                                                    field.name
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.teacherFee`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Teacher Fee
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step="0.01"
                                                                value={
                                                                    field.value ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value ===
                                                                            ""
                                                                            ? 0
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                    )
                                                                }
                                                                onBlur={
                                                                    field.onBlur
                                                                }
                                                                name={
                                                                    field.name
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Paid to the teacher.
                                                            Only this fee is
                                                            visible to faculty.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.monthlyClasses`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Classes / Month
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={31}
                                                                value={
                                                                    field.value ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value ===
                                                                            ""
                                                                            ? 0
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                    )
                                                                }
                                                                onBlur={
                                                                    field.onBlur
                                                                }
                                                                name={
                                                                    field.name
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.classesPerWeek`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Classes / Week
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={7}
                                                                value={
                                                                    field.value ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value ===
                                                                            ""
                                                                            ? 0
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                    )
                                                                }
                                                                onBlur={
                                                                    field.onBlur
                                                                }
                                                                name={
                                                                    field.name
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Seeds the monthly
                                                            quota (×4) when a
                                                            month has no
                                                            history.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.totalMonths`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Total Months
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={120}
                                                                placeholder="Ongoing"
                                                                value={
                                                                    field.value ??
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value ===
                                                                            ""
                                                                            ? null
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                    )
                                                                }
                                                                onBlur={
                                                                    field.onBlur
                                                                }
                                                                name={
                                                                    field.name
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Empty = ongoing
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`enrollments.${index}.startMonth`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Start Month
                                                        </FormLabel>
                                                        <FormControl>
                                                            <MonthPicker
                                                                value={
                                                                    field.value ??
                                                                    ""
                                                                }
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <EnrollmentWindowHint
                                            control={form.control}
                                            index={index}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`enrollments.${index}.isActive`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>
                                                            Active
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Inactive enrollments
                                                            stop appearing on
                                                            new monthly sheets.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={
                                                                field.value ??
                                                                false
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="min-w-0 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active</FormLabel>
                                                <FormDescription>
                                                    Inactive students are left
                                                    off new attendance sheets.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={
                                                        field.value ?? false
                                                    }
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {isEdit && data && (
                                    <div className="space-y-1 rounded-md border p-3">
                                        <p className="text-muted-foreground text-xs">
                                            Assigned ID
                                        </p>
                                        <p className="font-mono text-sm">
                                            {displayStudentId(data)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <FormFooterBar
                    visible={!isEdit || form.formState.isDirty}
                    isSubmitting={isSubmitting}
                    saveLabel={isEdit ? "Update Student" : "Create Student"}
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New student — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/students")}
                />
            </form>
        </Form>
    );
}

function EnrollmentWindowHint({
    control,
    index,
}: {
    control: Control<CreateStudent>;
    index: number;
}) {
    const startMonth = useWatch({
        control,
        name: `enrollments.${index}.startMonth`,
    });
    const totalMonths = useWatch({
        control,
        name: `enrollments.${index}.totalMonths`,
    });

    const window = formatEnrollmentWindow({
        startMonth: startMonth ?? "",
        totalMonths: totalMonths ?? null,
    });
    if (!window) return null;

    return (
        <p className="text-muted-foreground text-xs">
            Appears on attendance sheets: {window}
        </p>
    );
}
