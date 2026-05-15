"use client";
"use no memo";

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
import { Input } from "@/components/ui/input";
import { MediaSelectModal } from "@/components/ui/media-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Course,
    CreateTeacher,
    createTeacherSchema,
    generateUploadThingURL,
    Icons,
    Media,
    Teacher,
    UpdateTeacher,
} from "@workspace/config";
import { useCourse, useTeacher } from "@workspace/rq";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

interface PageProps {
    data?: Teacher;
}

export function TeacherFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useTeacher();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <TeacherManageForm />;

    if (!id || typeof id !== "string") redirect("/teachers");
    if (isPending) return <TeacherFormSkeleton />;
    if (!data) redirect("/teachers");

    return <TeacherManageForm data={data} />;
}

function TeacherFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
}

export function TeacherManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

    const { useScan: useCourseScan } = useCourse();
    const { data: courses = [], isPending: isCoursesPending } = useCourseScan(
        {}
    );

    const form = useForm<CreateTeacher>({
        resolver: zodResolver(createTeacherSchema),
        defaultValues: {
            courseId: data?.courseId ?? "",
            name: data?.name ?? "",
            about: data?.about ?? "",
            imageKey: data?.imageKey ?? "",
            rating: data?.rating ?? 5,
            experience: data?.experience ?? 1,
            isActive: data?.isActive ?? false,
        },
    });

    const { useCreate, useUpdate } = useTeacher();
    const { mutateAsync: createTeacher, isPending: isCreating } = useCreate();
    const { mutateAsync: updateTeacher, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const imageKey = useWatch({ control: form.control, name: "imageKey" });
    const previewUrl = imageKey ? generateUploadThingURL(imageKey) : null;

    const handleMediaSelection = (items: Media[]) => {
        const picked = items[0];
        if (!picked) return;

        setSelectedMedia(picked);
        form.setValue("imageKey", picked.key, { shouldDirty: true });
        form.clearErrors("imageKey");
    };

    const handleSubmit = async (values: CreateTeacher) => {
        if (isEdit && data) {
            await updateTeacher({
                id: data.id,
                values: values as UpdateTeacher,
            });
        } else {
            await createTeacher([values]);
        }
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
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter teacher name"
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="about"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>About</FormLabel>
                                            <FormControl>
                                                <AutosizeTextarea
                                                    {...field}
                                                    placeholder="Describe the teacher's background, expertise, and teaching style..."
                                                    rows={4}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="rating"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rating</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={5}
                                                        step={1}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value === ""
                                                                    ? 0
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value
                                                                      )
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                        placeholder="1 - 5"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Rating out of 5.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="experience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Experience (years)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value === ""
                                                                    ? 0
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value
                                                                      )
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                        placeholder="Years of experience"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="courseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ""}
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
                                                        (course: Course) => (
                                                            <SelectItem
                                                                key={course.id}
                                                                value={
                                                                    course.id
                                                                }
                                                            >
                                                                {course.title}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The course this teacher belongs
                                                to.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active</FormLabel>
                                                <FormDescription>
                                                    Inactive teachers are hidden
                                                    from the public site.
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Image</CardTitle>
                                <p className="text-muted-foreground text-xs">
                                    Shown on the teacher card and detail views.
                                </p>
                            </CardHeader>

                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="imageKey"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                {previewUrl ? (
                                                    <div className="space-y-3">
                                                        <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-md">
                                                            <Image
                                                                src={previewUrl}
                                                                alt="Teacher preview"
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <p className="text-muted-foreground truncate text-xs">
                                                            {selectedMedia?.name ??
                                                                imageKey}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full"
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                            onClick={() =>
                                                                setIsMediaSelectorOpen(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            Change Image
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full"
                                                        disabled={isSubmitting}
                                                        onClick={() =>
                                                            setIsMediaSelectorOpen(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <Icons.PlusCircle />
                                                        Select Image
                                                    </Button>
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isSubmitting}
                        onClick={() => router.push("/teachers")}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            (isEdit && !form.formState.isDirty) ||
                            !imageKey
                        }
                    >
                        {isEdit ? "Update Teacher" : "Create Teacher"}
                    </Button>
                </div>
            </form>

            <MediaSelectModal
                isOpen={isMediaSelectorOpen}
                setIsOpen={setIsMediaSelectorOpen}
                selected={selectedMedia ? [selectedMedia] : []}
                selectedKey={imageKey || undefined}
                types={["image"]}
                accept="image/*"
                onSelectionComplete={handleMediaSelection}
            />
        </Form>
    );
}
