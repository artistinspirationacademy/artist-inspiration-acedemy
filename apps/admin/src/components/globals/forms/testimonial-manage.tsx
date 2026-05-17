"use client";
"use no memo";

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
    CreateTestimonial,
    createTestimonialSchema,
    FullTestimonial,
    generateUploadThingURL,
    Icons,
    Media,
    UpdateTestimonial,
} from "@workspace/config";
import { useCourse, useTestimonial } from "@workspace/rq";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

interface PageProps {
    data?: FullTestimonial;
}

export function TestimonialFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useTestimonial();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <TestimonialManageForm />;

    if (!id || typeof id !== "string") redirect("/testimonials");
    if (isPending) return <TestimonialFormSkeleton />;
    if (!data) redirect("/testimonials");

    return <TestimonialManageForm data={data} />;
}

function TestimonialFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
}

export function TestimonialManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

    const { useScan: useCourseScan } = useCourse();
    const { data: courses = [], isPending: isCoursesPending } = useCourseScan(
        {}
    );

    const form = useForm<CreateTestimonial>({
        resolver: zodResolver(createTestimonialSchema),
        defaultValues: {
            name: data?.name ?? "",
            feedback: data?.feedback ?? "",
            avatarKey: data?.avatarKey ?? null,
            courseId: data?.courseId ?? null,
            rating: data?.rating ?? 5,
            country: data?.country ?? null,
            isActive: data?.isActive ?? true,
        },
    });

    const { useCreate, useUpdate } = useTestimonial();
    const { mutateAsync: createTestimonial, isPending: isCreating } =
        useCreate();
    const { mutateAsync: updateTestimonial, isPending: isUpdating } =
        useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const avatarKey = useWatch({ control: form.control, name: "avatarKey" });
    const avatarUrl = avatarKey ? generateUploadThingURL(avatarKey) : null;

    const handleMediaSelection = (items: Media[]) => {
        const picked = items[0];
        if (!picked) return;
        setSelectedMedia(picked);
        form.setValue("avatarKey", picked.key, { shouldDirty: true });
    };

    const handleSubmit = async (values: CreateTestimonial) => {
        if (isEdit && data) {
            await updateTestimonial({
                id: data.id,
                values: values as UpdateTestimonial,
            });
        } else {
            await createTestimonial([values]);
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
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., Jane Doe"
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Country (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        value={
                                                            field.value ?? ""
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value ||
                                                                    null
                                                            )
                                                        }
                                                        placeholder="e.g., United Kingdom"
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="feedback"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Feedback</FormLabel>
                                            <FormControl>
                                                <AutosizeTextarea
                                                    {...field}
                                                    placeholder="What did they say about their experience?"
                                                    rows={5}
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
                                                        Tap a star (1–5)
                                                    </span>
                                                </div>
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
                                    name="courseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Course (optional)
                                            </FormLabel>
                                            <FormControl>
                                                <CourseSelect
                                                    courses={courses}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={
                                                        isSubmitting ||
                                                        isCoursesPending
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Link this testimonial to a
                                                specific course, or leave
                                                unselected for a general one.
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
                                                    Inactive testimonials are
                                                    hidden from the public site.
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
                                <CardTitle>Avatar</CardTitle>
                                <p className="text-muted-foreground text-xs">
                                    A photo of the person giving the
                                    testimonial. Optional.
                                </p>
                            </CardHeader>

                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="avatarKey"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                {avatarUrl ? (
                                                    <div className="space-y-3">
                                                        <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-md">
                                                            <Image
                                                                src={avatarUrl}
                                                                alt="Avatar preview"
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="flex-1"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                                onClick={() =>
                                                                    setIsMediaSelectorOpen(
                                                                        true
                                                                    )
                                                                }
                                                            >
                                                                Change Avatar
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                                onClick={() =>
                                                                    form.setValue(
                                                                        "avatarKey",
                                                                        null,
                                                                        {
                                                                            shouldDirty: true,
                                                                        }
                                                                    )
                                                                }
                                                                title="Remove avatar"
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
                                                            setIsMediaSelectorOpen(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <Icons.PlusCircle />
                                                        Select Avatar
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
                    saveLabel={
                        isEdit ? "Update Testimonial" : "Create Testimonial"
                    }
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New testimonial — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/testimonials")}
                />
            </form>

            <MediaSelectModal
                isOpen={isMediaSelectorOpen}
                setIsOpen={setIsMediaSelectorOpen}
                selected={selectedMedia ? [selectedMedia] : []}
                selectedKey={avatarKey || undefined}
                types={["image"]}
                accept="image/*"
                onSelectionComplete={handleMediaSelection}
            />
        </Form>
    );
}

function CourseSelect({
    courses,
    value,
    onChange,
    disabled,
}: {
    courses: Course[];
    value: string | null;
    onChange: (next: string | null) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const selected = value ? courses.find((c) => c.id === value) : null;

    return (
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
                            "min-w-0 flex-1 truncate text-left",
                            !selected && "text-muted-foreground"
                        )}
                    >
                        {selected
                            ? selected.title
                            : "Select a course (optional)"}
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
                        <CommandGroup>
                            <CommandItem
                                value="__none__"
                                onSelect={() => {
                                    onChange(null);
                                    setOpen(false);
                                }}
                            >
                                <Icons.Check
                                    weight="bold"
                                    className={cn(
                                        "mr-2 size-4",
                                        !selected ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="text-muted-foreground">
                                    None (general)
                                </span>
                            </CommandItem>
                        </CommandGroup>
                        {courses.length > 0 && (
                            <CommandGroup heading="Courses">
                                {courses.map((course) => {
                                    const isSelected = value === course.id;
                                    return (
                                        <CommandItem
                                            key={course.id}
                                            value={course.title}
                                            onSelect={() => {
                                                onChange(
                                                    isSelected
                                                        ? null
                                                        : course.id
                                                );
                                                setOpen(false);
                                            }}
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
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
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
                const starValue = i + 1;
                const isFull = display >= starValue;

                return (
                    <button
                        key={starValue}
                        type="button"
                        aria-label={`Set rating to ${starValue}`}
                        disabled={disabled}
                        className={cn(
                            "relative size-7",
                            disabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                        )}
                        onMouseEnter={() => setHover(starValue)}
                        onClick={() => onChange(starValue)}
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
                    </button>
                );
            })}
            <span className="text-muted-foreground ml-2 text-sm font-medium tabular-nums">
                {display} / {max}
            </span>
        </div>
    );
}
