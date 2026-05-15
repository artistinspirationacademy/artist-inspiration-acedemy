"use client";
"use no memo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
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
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { MediaSelectModal } from "@/components/ui/media-select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    cn,
    Course,
    CreateTeacher,
    createTeacherSchema,
    FullCourseCategory,
    FullTeacher,
    generateUploadThingURL,
    Icons,
    Media,
    UpdateTeacher,
} from "@workspace/config";
import { useCourseCategory, useTeacher } from "@workspace/rq";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";

interface PageProps {
    data?: FullTeacher;
}

export function TeacherFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useTeacher();
    const { data, isPending } = useGet<FullTeacher>({
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
    const [isVideoSelectorOpen, setIsVideoSelectorOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Media | null>(null);
    const [experienceInput, setExperienceInput] = useState<string>(() =>
        String(data?.experience ?? 1)
    );

    const { useScan: useCourseCategoryScan } = useCourseCategory();
    const { data: categories = [], isPending: isCoursesPending } =
        useCourseCategoryScan<FullCourseCategory[]>({ include: "courses" });

    const form = useForm<CreateTeacher>({
        resolver: zodResolver(
            createTeacherSchema
        ) as unknown as Resolver<CreateTeacher>,
        defaultValues: {
            courseIds: data?.courses?.map((c) => c.id) ?? [],
            name: data?.name ?? "",
            about: data?.about ?? "",
            imageKey: data?.imageKey ?? "",
            videoKey: data?.videoKey ?? null,
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
    const videoKey = useWatch({ control: form.control, name: "videoKey" });
    const previewUrl = imageKey ? generateUploadThingURL(imageKey) : null;
    const videoUrl = videoKey ? generateUploadThingURL(videoKey) : null;

    const handleMediaSelection = (items: Media[]) => {
        const picked = items[0];
        if (!picked) return;

        setSelectedMedia(picked);
        form.setValue("imageKey", picked.key, { shouldDirty: true });
        form.clearErrors("imageKey");
    };

    const handleVideoSelection = (items: Media[]) => {
        const picked = items[0];
        if (!picked) return;

        setSelectedVideo(picked);
        form.setValue("videoKey", picked.key, { shouldDirty: true });
        form.clearErrors("videoKey");
    };

    const clearVideo = () => {
        setSelectedVideo(null);
        form.setValue("videoKey", null, { shouldDirty: true });
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

                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating</FormLabel>
                                            <FormControl>
                                                <div className="bg-muted/40 flex items-center justify-between rounded-md border px-4 py-3">
                                                    <StarRating
                                                        value={field.value ?? 0}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        disabled={isSubmitting}
                                                    />
                                                    <span className="text-muted-foreground text-xs">
                                                        Tap a star (left half
                                                        for .5)
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Experience</FormLabel>
                                            <FormControl>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        type="text"
                                                        inputMode="decimal"
                                                        pattern="[0-9]*\.?[0-9]*"
                                                        maxLength={5}
                                                        placeholder="e.g. 1.5"
                                                        value={experienceInput}
                                                        onChange={(e) => {
                                                            const raw =
                                                                e.target.value;
                                                            const cleaned = raw
                                                                .replace(
                                                                    /[^0-9.]/g,
                                                                    ""
                                                                )
                                                                .replace(
                                                                    /(\..*)\./g,
                                                                    "$1"
                                                                );
                                                            setExperienceInput(
                                                                cleaned
                                                            );
                                                            if (
                                                                cleaned === ""
                                                            ) {
                                                                field.onChange(
                                                                    undefined
                                                                );
                                                            } else if (
                                                                !cleaned.endsWith(
                                                                    "."
                                                                )
                                                            ) {
                                                                field.onChange(
                                                                    Number(
                                                                        cleaned
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (
                                                                experienceInput.endsWith(
                                                                    "."
                                                                )
                                                            ) {
                                                                const norm =
                                                                    experienceInput.slice(
                                                                        0,
                                                                        -1
                                                                    );
                                                                setExperienceInput(
                                                                    norm
                                                                );
                                                                field.onChange(
                                                                    norm
                                                                        ? Number(
                                                                              norm
                                                                          )
                                                                        : undefined
                                                                );
                                                            }
                                                            field.onBlur();
                                                        }}
                                                        name={field.name}
                                                        disabled={isSubmitting}
                                                    />
                                                    <InputGroupAddon align="inline-end">
                                                        year(s)
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    name="courseIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Courses</FormLabel>
                                            <FormControl>
                                                <CourseMultiSelect
                                                    categories={categories}
                                                    value={field.value ?? []}
                                                    onChange={field.onChange}
                                                    disabled={
                                                        isSubmitting ||
                                                        isCoursesPending
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Courses this teacher can teach.
                                                Choose one or more.
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Intro Video</CardTitle>
                                <p className="text-muted-foreground text-xs">
                                    Optional 1–2 minute intro shown on the
                                    teacher profile.
                                </p>
                            </CardHeader>

                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="videoKey"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                {videoUrl ? (
                                                    <div className="space-y-3">
                                                        <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md">
                                                            <video
                                                                src={videoUrl}
                                                                controls
                                                                preload="metadata"
                                                                className="size-full object-contain"
                                                            />
                                                        </div>
                                                        <p className="text-muted-foreground truncate text-xs">
                                                            {selectedVideo?.name ??
                                                                videoKey}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="flex-1"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                                onClick={() =>
                                                                    setIsVideoSelectorOpen(
                                                                        true
                                                                    )
                                                                }
                                                            >
                                                                Change Video
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                                onClick={
                                                                    clearVideo
                                                                }
                                                                title="Remove video"
                                                            >
                                                                <Icons.Trash className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full"
                                                        disabled={isSubmitting}
                                                        onClick={() =>
                                                            setIsVideoSelectorOpen(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <Icons.PlusCircle />
                                                        Select Video
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

                <FormFooterBar
                    visible={!isEdit || form.formState.isDirty}
                    isSubmitting={isSubmitting}
                    saveDisabled={!imageKey}
                    saveLabel={isEdit ? "Update Teacher" : "Create Teacher"}
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New teacher — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/teachers")}
                />
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

            <MediaSelectModal
                isOpen={isVideoSelectorOpen}
                setIsOpen={setIsVideoSelectorOpen}
                selected={selectedVideo ? [selectedVideo] : []}
                selectedKey={videoKey || undefined}
                types={["video"]}
                accept="video/*"
                onSelectionComplete={handleVideoSelection}
            />
        </Form>
    );
}

function CourseMultiSelect({
    categories,
    value,
    onChange,
    disabled,
}: {
    categories: FullCourseCategory[];
    value: string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);

    const allCourses = useMemo(
        () =>
            categories.flatMap((c) =>
                (c.courses ?? []).map((course) => ({
                    course,
                    categoryName: c.name,
                }))
            ),
        [categories]
    );

    const courseMap = useMemo(() => {
        const map = new Map<string, Course>();
        allCourses.forEach(({ course }) => map.set(course.id, course));
        return map;
    }, [allCourses]);

    const selected = value
        .map((id) => courseMap.get(id))
        .filter((c): c is Course => !!c);

    const toggle = (id: string) => {
        if (value.includes(id)) onChange(value.filter((v) => v !== id));
        else onChange([...value, id]);
    };

    const remove = (id: string) => onChange(value.filter((v) => v !== id));

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        disabled={disabled}
                        className="h-auto min-h-10 w-full justify-between px-3 font-normal"
                    >
                        <span
                            className={cn(
                                "truncate",
                                selected.length === 0 && "text-muted-foreground"
                            )}
                        >
                            {selected.length === 0
                                ? "Select courses"
                                : `${selected.length} course${selected.length === 1 ? "" : "s"} selected`}
                        </span>
                        <Icons.CaretUpDown
                            weight="bold"
                            className="size-4 shrink-0 opacity-50"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder="Search courses..." />
                        <CommandList>
                            <CommandEmpty>No courses found.</CommandEmpty>
                            {categories.map((category) => {
                                const inCategory = category.courses ?? [];
                                if (!inCategory.length) return null;
                                return (
                                    <CommandGroup
                                        key={category.id}
                                        heading={category.name}
                                    >
                                        {inCategory.map((course) => {
                                            const isSelected = value.includes(
                                                course.id
                                            );
                                            return (
                                                <CommandItem
                                                    key={course.id}
                                                    value={`${course.title} ${category.name}`}
                                                    onSelect={() =>
                                                        toggle(course.id)
                                                    }
                                                >
                                                    <Icons.Check
                                                        weight="bold"
                                                        className={cn(
                                                            "mr-2 size-4",
                                                            isSelected
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {course.title}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                );
                            })}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map((course) => (
                        <Badge
                            key={course.id}
                            variant="secondary"
                            className="gap-1 pr-1"
                        >
                            <span className="max-w-[140px] truncate">
                                {course.title}
                            </span>
                            <button
                                type="button"
                                onClick={() => remove(course.id)}
                                disabled={disabled}
                                className="hover:bg-foreground/10 -mr-0.5 inline-flex size-4 items-center justify-center rounded-full"
                                aria-label={`Remove ${course.title}`}
                            >
                                <Icons.Close className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

function StarRating({
    value,
    onChange,
    disabled,
    max = 5,
}: {
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
    max?: number;
}) {
    const [hover, setHover] = useState<number | null>(null);
    const display = hover ?? value;

    return (
        <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHover(null)}
        >
            {Array.from({ length: max }, (_, i) => {
                const starIndex = i + 1;
                const halfValue = starIndex - 0.5;
                const fullValue = starIndex;
                const isFull = display >= fullValue;
                const isHalf = !isFull && display >= halfValue;

                return (
                    <div
                        key={starIndex}
                        className={cn(
                            "relative size-7",
                            disabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                        )}
                    >
                        <Icons.Star
                            weight={isFull ? "fill" : "regular"}
                            className={cn(
                                "size-7",
                                isFull
                                    ? "text-amber-500"
                                    : "text-muted-foreground/40"
                            )}
                        />
                        {isHalf && (
                            <Icons.StarHalf
                                weight="fill"
                                className="absolute inset-0 size-7 text-amber-500"
                            />
                        )}
                        <button
                            type="button"
                            aria-label={`Set rating to ${halfValue}`}
                            disabled={disabled}
                            className="absolute inset-y-0 left-0 w-1/2"
                            onMouseEnter={() => setHover(halfValue)}
                            onClick={() => onChange(halfValue)}
                        />
                        <button
                            type="button"
                            aria-label={`Set rating to ${fullValue}`}
                            disabled={disabled}
                            className="absolute inset-y-0 right-0 w-1/2"
                            onMouseEnter={() => setHover(fullValue)}
                            onClick={() => onChange(fullValue)}
                        />
                    </div>
                );
            })}
            <span className="text-muted-foreground ml-2 text-sm font-medium tabular-nums">
                {display.toFixed(1)}
            </span>
        </div>
    );
}
