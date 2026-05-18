"use client";
"use no memo";

import { CourseDetailsReorder } from "@/components/dashboard/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CourseFormSkeleton } from "@/components/globals/skeletons";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    convertValueToLabel,
    CourseCategory,
    CreateCourse,
    createCourseSchema,
    FullCourse,
    generateUploadThingURL,
    Icons,
    Media,
    UpdateCourse,
} from "@workspace/config";
import { useCourse, useCourseCategory } from "@workspace/rq";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
    useFieldArray,
    useForm,
    useWatch,
    type Resolver,
    type UseFormReturn,
} from "react-hook-form";

interface PageProps {
    data?: FullCourse;
}

export function CourseFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useCourse();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <CourseManageForm />;

    if (!id || typeof id !== "string") redirect("/courses");
    if (isPending) return <CourseFormSkeleton />;
    if (!data) redirect("/courses");

    return <CourseManageForm data={data} />;
}

export function CourseManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const [imageSelectorTarget, setImageSelectorTarget] = useState<
        "card" | "cover" | null
    >(null);
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [selectedCardImage, setSelectedCardImage] = useState<Media | null>(
        null
    );
    const [selectedCoverImage, setSelectedCoverImage] = useState<Media | null>(
        null
    );

    const { useScan: useCategoryScan } = useCourseCategory();
    const { data: categories = [], isPending: isCategoriesPending } =
        useCategoryScan({});

    const form = useForm<CreateCourse>({
        resolver: zodResolver(
            createCourseSchema
        ) as unknown as Resolver<CreateCourse>,
        defaultValues: {
            courseCategoryId: data?.courseCategoryId ?? "",
            title: data?.title ?? "",
            description: data?.description ?? "",
            cardImageKey: data?.cardImageKey ?? "",
            coverImageKey: data?.coverImageKey ?? "",
            isActive: data?.isActive ?? false,
            details:
                data?.details?.map((d) => {
                    if (d.type === "text" || d.type === "image") {
                        return {
                            title: d.title,
                            content: d.content as string,
                            type: d.type,
                            position: d.position,
                        };
                    }
                    return {
                        title: d.title,
                        content: d.content as {
                            key: string;
                            value: string;
                        }[],
                        type: d.type,
                        position: d.position,
                    };
                }) ?? [],
        },
    });

    const {
        fields: detailFields,
        append: appendDetail,
        remove: removeDetail,
    } = useFieldArray({
        control: form.control,
        name: "details",
    });

    const { useCreate, useUpdate } = useCourse();
    const { mutateAsync: createCourse, isPending: isCreating } = useCreate();
    const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const cardImageKey = useWatch({
        control: form.control,
        name: "cardImageKey",
    });
    const coverImageKey = useWatch({
        control: form.control,
        name: "coverImageKey",
    });

    const cardPreviewUrl = cardImageKey
        ? generateUploadThingURL(cardImageKey)
        : null;
    const coverPreviewUrl = coverImageKey
        ? generateUploadThingURL(coverImageKey)
        : null;

    const handleImageSelection = (items: Media[]) => {
        const picked = items[0];
        if (!picked || !imageSelectorTarget) return;

        const field =
            imageSelectorTarget === "card" ? "cardImageKey" : "coverImageKey";

        if (imageSelectorTarget === "card") setSelectedCardImage(picked);
        else setSelectedCoverImage(picked);

        form.setValue(field, picked.key, { shouldDirty: true });
        form.clearErrors(field);
    };

    const addDetail = () => {
        appendDetail({
            title: "",
            content: "",
            type: "text",
            position: detailFields.length + 1,
        });
    };

    const handleSubmit = async (values: CreateCourse) => {
        if (isEdit && data) {
            await updateCourse({
                id: data.id,
                values: values as UpdateCourse,
            });
        } else {
            await createCourse([values]);
        }
    };

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
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
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter course title"
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <AutosizeTextarea
                                                        {...field}
                                                        placeholder="Describe what students will learn..."
                                                        rows={3}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <CourseDetailsCard
                                form={form}
                                detailFields={detailFields}
                                removeDetail={removeDetail}
                                addDetail={addDetail}
                                onReorderClick={() =>
                                    setIsReorderModalOpen(true)
                                }
                                isPending={isSubmitting}
                            />
                        </div>

                        <div className="min-w-0 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="courseCategoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value || ""}
                                                    disabled={
                                                        isSubmitting ||
                                                        isCategoriesPending
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map(
                                                            (
                                                                category: CourseCategory
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    value={
                                                                        category.id
                                                                    }
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Manage categories from the
                                                    courses list page.
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
                                                    <FormLabel>
                                                        Active
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Inactive courses are
                                                        hidden from the public
                                                        site.
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
                                    <CardTitle>Card Image</CardTitle>
                                    <p className="text-muted-foreground text-xs">
                                        Shown on the course card in listings.
                                    </p>
                                </CardHeader>

                                <CardContent>
                                    <ImagePickerField
                                        name="cardImageKey"
                                        previewUrl={cardPreviewUrl}
                                        previewLabel={
                                            selectedCardImage?.name ??
                                            cardImageKey
                                        }
                                        isPending={isSubmitting}
                                        onOpen={() =>
                                            setImageSelectorTarget("card")
                                        }
                                        form={form}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Cover Image</CardTitle>
                                    <p className="text-muted-foreground text-xs">
                                        Shown at the top of the course detail
                                        page.
                                    </p>
                                </CardHeader>

                                <CardContent>
                                    <ImagePickerField
                                        name="coverImageKey"
                                        previewUrl={coverPreviewUrl}
                                        previewLabel={
                                            selectedCoverImage?.name ??
                                            coverImageKey
                                        }
                                        isPending={isSubmitting}
                                        onOpen={() =>
                                            setImageSelectorTarget("cover")
                                        }
                                        form={form}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <FormFooterBar
                        visible={!isEdit || form.formState.isDirty}
                        isSubmitting={isSubmitting}
                        saveDisabled={!cardImageKey || !coverImageKey}
                        saveLabel={isEdit ? "Update Course" : "Create Course"}
                        savingLabel={isEdit ? "Updating..." : "Creating..."}
                        message={
                            isEdit
                                ? "You have unsaved changes"
                                : "New course — fill the details and save"
                        }
                        cancelLabel="Cancel"
                        onCancel={() => router.push("/courses")}
                    />
                </form>
            </Form>

            <MediaSelectModal
                isOpen={imageSelectorTarget !== null}
                setIsOpen={(open) =>
                    setImageSelectorTarget(
                        typeof open === "function"
                            ? open(imageSelectorTarget !== null)
                                ? imageSelectorTarget
                                : null
                            : open
                              ? imageSelectorTarget
                              : null
                    )
                }
                selected={
                    imageSelectorTarget === "card"
                        ? selectedCardImage
                            ? [selectedCardImage]
                            : []
                        : selectedCoverImage
                          ? [selectedCoverImage]
                          : []
                }
                selectedKey={
                    imageSelectorTarget === "card"
                        ? cardImageKey || undefined
                        : coverImageKey || undefined
                }
                types={["image"]}
                accept="image/*"
                onSelectionComplete={handleImageSelection}
            />

            <Dialog
                open={isReorderModalOpen}
                onOpenChange={setIsReorderModalOpen}
            >
                <DialogContent className="max-h-[80vh] overflow-y-auto lg:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Reorder Course Details</DialogTitle>
                        <DialogDescription>
                            Drag and drop to reorder the course detail sections.
                            Click Save to apply changes.
                        </DialogDescription>
                    </DialogHeader>

                    <CourseDetailsReorder
                        form={form as unknown as UseFormReturn<UpdateCourse>}
                        detailFields={
                            detailFields as unknown as (NonNullable<
                                UpdateCourse["details"]
                            >[number] & { id: string })[]
                        }
                        onFinish={() => setIsReorderModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

function ImagePickerField({
    name,
    previewUrl,
    previewLabel,
    isPending,
    onOpen,
    form,
}: {
    name: "cardImageKey" | "coverImageKey";
    previewUrl: string | null;
    previewLabel: string | undefined;
    isPending: boolean;
    onOpen: () => void;
    form: UseFormReturn<CreateCourse>;
}) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={() => (
                <FormItem>
                    {previewUrl ? (
                        <div className="space-y-3">
                            <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md">
                                <Image
                                    src={previewUrl}
                                    alt="Course preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <p className="text-muted-foreground truncate text-xs">
                                {previewLabel || convertValueToLabel(name)}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={isPending}
                                onClick={onOpen}
                            >
                                Change Image
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={isPending}
                            onClick={onOpen}
                        >
                            <Icons.PlusCircle />
                            Select Image
                        </Button>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface CourseDetailsCardProps {
    form: UseFormReturn<CreateCourse>;
    detailFields: { id: string }[];
    removeDetail: (index: number) => void;
    addDetail: () => void;
    onReorderClick: () => void;
    isPending: boolean;
}

function CourseDetailsCard({
    form,
    detailFields,
    removeDetail,
    addDetail,
    onReorderClick,
    isPending,
}: CourseDetailsCardProps) {
    const liveDetails = form.watch("details");

    const sortedFields = detailFields
        .map((f, index) => ({
            field: f,
            originalIndex: index,
            position: liveDetails?.[index]?.position ?? index + 1,
        }))
        .sort((a, b) => a.position - b.position);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {sortedFields.map(({ field, originalIndex }, sortedIndex) => (
                    <DetailCard
                        key={field.id}
                        form={form}
                        index={originalIndex}
                        displayIndex={sortedIndex}
                        removeDetail={removeDetail}
                        isPending={isPending}
                    />
                ))}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={addDetail}
                        disabled={isPending}
                    >
                        <Icons.Plus />
                        Add Detail Section
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onReorderClick}
                        disabled={isPending || detailFields.length === 0}
                        title="Reorder sections"
                    >
                        <Icons.CaretUpDown className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function DetailCard({
    form,
    index,
    displayIndex,
    removeDetail,
    isPending,
}: {
    form: UseFormReturn<CreateCourse>;
    index: number;
    displayIndex: number;
    removeDetail: (index: number) => void;
    isPending: boolean;
}) {
    const type = useWatch({
        control: form.control,
        name: `details.${index}.type`,
    });

    const addItem = () => {
        const current = form.getValues(`details.${index}.content`);
        if (Array.isArray(current)) {
            form.setValue(`details.${index}.content`, [
                ...current,
                { key: "", value: "" },
            ]);
        }
    };

    return (
        <div className="bg-muted/30 border-muted flex flex-col gap-6 overflow-hidden rounded-xl border py-6 pt-0 shadow-none">
            <div className="bg-muted flex items-center justify-between gap-2 px-4 py-2">
                <Button
                    type="button"
                    size="icon"
                    className="size-6 rounded-full"
                >
                    {displayIndex + 1}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeDetail(index)}
                    disabled={isPending}
                >
                    <Icons.Trash className="size-4" />
                </Button>
            </div>

            <div className="space-y-4 px-4">
                <div className="grid gap-4 sm:grid-cols-[1fr,160px]">
                    <FormField
                        control={form.control}
                        name={`details.${index}.title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="e.g., Overview"
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`details.${index}.type`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (
                                            value === "text" ||
                                            value === "image"
                                        ) {
                                            form.setValue(
                                                `details.${index}.content`,
                                                ""
                                            );
                                        } else {
                                            form.setValue(
                                                `details.${index}.content`,
                                                []
                                            );
                                        }
                                    }}
                                    value={field.value}
                                    disabled={isPending}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="text">
                                            <div className="flex items-center gap-2">
                                                <Icons.FileText className="size-3.5" />
                                                Text
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="accordion">
                                            <div className="flex items-center gap-2">
                                                <Icons.Stack className="size-3.5" />
                                                Accordion
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="image">
                                            <div className="flex items-center gap-2">
                                                <Icons.Image className="size-3.5" />
                                                Image
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="grid">
                                            <div className="flex items-center gap-2">
                                                <Icons.Rows className="size-3.5" />
                                                Grid
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {type === "text" ? (
                    <FormField
                        control={form.control}
                        name={`details.${index}.content`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <AutosizeTextarea
                                        {...field}
                                        value={(field.value as string) ?? ""}
                                        placeholder="Enter detailed content..."
                                        minHeight={160}
                                        disabled={isPending}
                                        className="resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : type === "image" ? (
                    <ImageDetailContent
                        form={form}
                        index={index}
                        isPending={isPending}
                    />
                ) : (
                    <KeyValueDetailContent
                        form={form}
                        index={index}
                        addItem={addItem}
                        isPending={isPending}
                        label={
                            type === "accordion"
                                ? "Accordion Items"
                                : "Grid Items"
                        }
                    />
                )}
            </div>
        </div>
    );
}

function ImageDetailContent({
    form,
    index,
    isPending,
}: {
    form: UseFormReturn<CreateCourse>;
    index: number;
    isPending: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Media | null>(null);
    const value = useWatch({
        control: form.control,
        name: `details.${index}.content`,
    });
    const url =
        typeof value === "string" && value
            ? generateUploadThingURL(value)
            : null;

    return (
        <FormField
            control={form.control}
            name={`details.${index}.content`}
            render={() => (
                <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                        <div className="space-y-3">
                            {url && (
                                <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md">
                                    <Image
                                        src={url}
                                        alt={selected?.name ?? "detail"}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={isPending}
                                onClick={() => setIsOpen(true)}
                            >
                                {url ? "Change image" : "Select image"}
                            </Button>

                            <MediaSelectModal
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                selected={selected ? [selected] : []}
                                selectedKey={
                                    typeof value === "string"
                                        ? value
                                        : undefined
                                }
                                types={["image"]}
                                accept="image/*"
                                onSelectionComplete={(items) => {
                                    const picked = items[0];
                                    if (!picked) return;
                                    setSelected(picked);
                                    form.setValue(
                                        `details.${index}.content`,
                                        picked.key,
                                        { shouldDirty: true }
                                    );
                                }}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function KeyValueDetailContent({
    form,
    index,
    addItem,
    isPending,
    label,
}: {
    form: UseFormReturn<CreateCourse>;
    index: number;
    addItem: () => void;
    isPending: boolean;
    label: string;
}) {
    const items = useWatch({
        control: form.control,
        name: `details.${index}.content`,
    });

    const list = Array.isArray(items) ? items : [];

    return (
        <div className="space-y-3">
            <Separator />
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2">
                {list.map((item, itemIndex) => (
                    <KeyValueRow
                        key={`${index}-${itemIndex}`}
                        form={form}
                        detailIndex={index}
                        itemIndex={itemIndex}
                        isPending={isPending}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addItem}
                disabled={isPending}
            >
                <Icons.Plus />
                Add Item
            </Button>
        </div>
    );
}

function KeyValueRow({
    form,
    detailIndex,
    itemIndex,
    isPending,
}: {
    form: UseFormReturn<CreateCourse>;
    detailIndex: number;
    itemIndex: number;
    isPending: boolean;
}) {
    const removeItem = () => {
        const current = form.getValues(`details.${detailIndex}.content`);
        if (Array.isArray(current)) {
            form.setValue(
                `details.${detailIndex}.content`,
                current.filter((_, i) => i !== itemIndex),
                { shouldDirty: true }
            );
        }
    };

    return (
        <div className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <FormField
                    control={form.control}
                    name={`details.${detailIndex}.content.${itemIndex}.key`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Key"
                                    disabled={isPending}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`details.${detailIndex}.content.${itemIndex}.value`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Value"
                                    disabled={isPending}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-9 shrink-0"
                onClick={removeItem}
                disabled={isPending}
            >
                <Icons.Close className="size-4" />
            </Button>
        </div>
    );
}
