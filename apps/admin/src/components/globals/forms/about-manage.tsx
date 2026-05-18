"use client";
"use no memo";

import { AboutSectionsReorder } from "@/components/dashboard/about";
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
import { AboutFormSkeleton } from "@/components/globals/skeletons";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ABOUT_SECTION_TYPES,
    AboutSection,
    CreateAboutSection,
    generateUploadThingURL,
    Icons,
    Media,
    replaceAboutSchema,
} from "@workspace/config";
import { useAbout } from "@workspace/rq";
import Image from "next/image";
import { useState } from "react";
import {
    useFieldArray,
    useForm,
    useWatch,
    type Resolver,
    type UseFormReturn,
} from "react-hook-form";

type FormValues = { sections: CreateAboutSection[] };

const TYPE_LABELS: Record<(typeof ABOUT_SECTION_TYPES)[number], string> = {
    text: "Text",
    image: "Image",
    image_text: "Image + Text",
    image_text_reverse: "Text + Image",
    accordion: "Accordion",
    grid: "Grid",
    quote: "Quote",
    cta: "Call to Action",
};

const TYPE_ICONS: Record<
    (typeof ABOUT_SECTION_TYPES)[number],
    keyof typeof Icons
> = {
    text: "FileText",
    image: "Image",
    image_text: "Image",
    image_text_reverse: "Image",
    accordion: "Stack",
    grid: "Rows",
    quote: "ArrowRight",
    cta: "Sparkle",
};

function defaultContentForType(
    type: (typeof ABOUT_SECTION_TYPES)[number]
): CreateAboutSection["content"] {
    switch (type) {
        case "text":
            return "";
        case "image":
            return "";
        case "image_text":
        case "image_text_reverse":
            return { imageKey: "", heading: "", text: "" };
        case "accordion":
        case "grid":
            return [];
        case "quote":
            return { text: "", author: "", role: "" };
        case "cta":
            return {
                heading: "",
                description: "",
                buttonText: "",
                buttonLink: "",
            };
    }
}

export function AboutFetch() {
    const { useGet } = useAbout();
    const { data, isPending } = useGet();

    if (isPending) return <AboutFormSkeleton />;
    return <AboutManageForm data={data ?? []} />;
}

function toCreateShape(section: AboutSection): CreateAboutSection {
    return {
        type: section.type,
        title: section.title,
        position: section.position,
        isActive: section.isActive,
        content: section.content,
    } as CreateAboutSection;
}

export function AboutManageForm({ data }: { data: AboutSection[] }) {
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(
            replaceAboutSchema
        ) as unknown as Resolver<FormValues>,
        defaultValues: {
            sections: data
                .slice()
                .sort((a, b) => a.position - b.position)
                .map(toCreateShape),
        },
    });

    const {
        fields: sectionFields,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: "sections",
    });

    const { useReplace } = useAbout();
    const { mutateAsync: replaceAbout, isPending: isSaving } = useReplace();

    const handleSubmit = async (values: FormValues) => {
        await replaceAbout(values.sections);
        form.reset(values);
    };

    const addSection = (type: (typeof ABOUT_SECTION_TYPES)[number]) => {
        append({
            type,
            title: "",
            position: sectionFields.length + 1,
            isActive: true,
            content: defaultContentForType(type),
        } as CreateAboutSection);
    };

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                >
                    <AboutSectionsCard
                        form={form}
                        sectionFields={sectionFields}
                        removeSection={remove}
                        addSection={addSection}
                        onReorderClick={() => setIsReorderModalOpen(true)}
                        isPending={isSaving}
                    />

                    <FormFooterBar
                        visible={form.formState.isDirty}
                        isSubmitting={isSaving}
                        saveLabel="Save About page"
                        savingLabel="Saving..."
                        cancelLabel="Discard"
                        message="You have unsaved changes"
                        onCancel={() =>
                            form.reset({
                                sections: data
                                    .slice()
                                    .sort((a, b) => a.position - b.position)
                                    .map(toCreateShape),
                            })
                        }
                    />
                </form>
            </Form>

            <Dialog
                open={isReorderModalOpen}
                onOpenChange={setIsReorderModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reorder sections</DialogTitle>
                        <DialogDescription>
                            Drag sections to change their order on the page.
                        </DialogDescription>
                    </DialogHeader>
                    <AboutSectionsReorder
                        form={form}
                        sectionFields={sectionFields as never}
                        onFinish={() => setIsReorderModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

interface SectionsCardProps {
    form: UseFormReturn<FormValues>;
    sectionFields: { id: string }[];
    removeSection: (index: number) => void;
    addSection: (type: (typeof ABOUT_SECTION_TYPES)[number]) => void;
    onReorderClick: () => void;
    isPending: boolean;
}

function AboutSectionsCard({
    form,
    sectionFields,
    removeSection,
    addSection,
    onReorderClick,
    isPending,
}: SectionsCardProps) {
    const liveSections = form.watch("sections");

    const sortedFields = sectionFields
        .map((f, index) => ({
            field: f,
            originalIndex: index,
            position: liveSections?.[index]?.position ?? index + 1,
        }))
        .sort((a, b) => a.position - b.position);

    return (
        <Card>
            <CardHeader>
                <CardTitle>About Page Sections</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {sortedFields.length === 0 && (
                    <p className="text-muted-foreground rounded-md border border-dashed py-10 text-center text-sm">
                        No sections yet. Add your first section below.
                    </p>
                )}

                {sortedFields.map(({ field, originalIndex }, sortedIndex) => (
                    <SectionCard
                        key={field.id}
                        form={form}
                        index={originalIndex}
                        displayIndex={sortedIndex}
                        removeSection={removeSection}
                        isPending={isPending}
                    />
                ))}

                <div className="flex flex-col gap-2 sm:flex-row">
                    <AddSectionPicker
                        onAdd={addSection}
                        isPending={isPending}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onReorderClick}
                        disabled={isPending || sectionFields.length === 0}
                        title="Reorder sections"
                    >
                        <Icons.CaretUpDown className="size-4" />
                        Reorder
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AddSectionPicker({
    onAdd,
    isPending,
}: {
    onAdd: (type: (typeof ABOUT_SECTION_TYPES)[number]) => void;
    isPending: boolean;
}) {
    return (
        <Select
            onValueChange={(value) =>
                onAdd(value as (typeof ABOUT_SECTION_TYPES)[number])
            }
            value=""
            disabled={isPending}
        >
            <SelectTrigger className="flex-1">
                <SelectValue placeholder="+ Add a section" />
            </SelectTrigger>
            <SelectContent>
                {ABOUT_SECTION_TYPES.map((type) => {
                    const IconComponent = Icons[TYPE_ICONS[type]];
                    return (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                                <IconComponent className="size-3.5" />
                                {TYPE_LABELS[type]}
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

function SectionCard({
    form,
    index,
    displayIndex,
    removeSection,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    displayIndex: number;
    removeSection: (index: number) => void;
    isPending: boolean;
}) {
    const type = useWatch({
        control: form.control,
        name: `sections.${index}.type`,
    });
    const isActive = useWatch({
        control: form.control,
        name: `sections.${index}.isActive`,
    });

    return (
        <div className="bg-muted/30 border-muted flex flex-col gap-6 overflow-hidden rounded-xl border py-6 pt-0 shadow-none">
            <div className="bg-muted flex items-center justify-between gap-2 px-4 py-2">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="icon"
                        className="size-6 rounded-full"
                    >
                        {displayIndex + 1}
                    </Button>
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        {TYPE_LABELS[type]}
                    </span>
                    {!isActive && (
                        <span className="bg-muted-foreground/10 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                            Hidden
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <FormField
                        control={form.control}
                        name={`sections.${index}.isActive`}
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormLabel className="text-muted-foreground text-xs">
                                    Visible
                                </FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? true}
                                        onCheckedChange={field.onChange}
                                        disabled={isPending}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeSection(index)}
                        disabled={isPending}
                    >
                        <Icons.Trash className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4 px-4">
                <FormField
                    control={form.control}
                    name={`sections.${index}.title`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Our Story"
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Internal label. May or may not show on the
                                public page depending on section type.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <SectionContentEditor
                    form={form}
                    index={index}
                    type={type}
                    isPending={isPending}
                />
            </div>
        </div>
    );
}

function SectionContentEditor({
    form,
    index,
    type,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    type: (typeof ABOUT_SECTION_TYPES)[number];
    isPending: boolean;
}) {
    switch (type) {
        case "text":
            return (
                <TextContent form={form} index={index} isPending={isPending} />
            );
        case "image":
            return (
                <ImageContent form={form} index={index} isPending={isPending} />
            );
        case "image_text":
        case "image_text_reverse":
            return (
                <ImageTextContent
                    form={form}
                    index={index}
                    isPending={isPending}
                />
            );
        case "accordion":
        case "grid":
            return (
                <KeyValueContent
                    form={form}
                    index={index}
                    isPending={isPending}
                    label={
                        type === "accordion" ? "Accordion Items" : "Grid Items"
                    }
                />
            );
        case "quote":
            return (
                <QuoteContent form={form} index={index} isPending={isPending} />
            );
        case "cta":
            return (
                <CtaContent form={form} index={index} isPending={isPending} />
            );
        default:
            return null;
    }
}

function TextContent({
    form,
    index,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    isPending: boolean;
}) {
    return (
        <FormField
            control={form.control}
            name={`sections.${index}.content`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                        <AutosizeTextarea
                            {...field}
                            value={(field.value as string) ?? ""}
                            placeholder="Write the paragraph..."
                            minHeight={160}
                            disabled={isPending}
                            className="resize-none"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function ImagePicker({
    value,
    onChange,
    isPending,
    label = "Image",
}: {
    value: string;
    onChange: (key: string) => void;
    isPending: boolean;
    label?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Media | null>(null);
    const url = value ? generateUploadThingURL(value) : null;

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <div className="space-y-3">
                    {url && (
                        <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md">
                            <Image
                                src={url}
                                alt={selected?.name ?? "section image"}
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
                        selectedKey={value || undefined}
                        types={["image"]}
                        accept="image/*"
                        onSelectionComplete={(items) => {
                            const picked = items[0];
                            if (!picked) return;
                            setSelected(picked);
                            onChange(picked.key);
                        }}
                    />
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}

function ImageContent({
    form,
    index,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    isPending: boolean;
}) {
    const value = useWatch({
        control: form.control,
        name: `sections.${index}.content`,
    });

    return (
        <ImagePicker
            value={typeof value === "string" ? value : ""}
            onChange={(key) =>
                form.setValue(`sections.${index}.content`, key, {
                    shouldDirty: true,
                })
            }
            isPending={isPending}
        />
    );
}

function ImageTextContent({
    form,
    index,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    isPending: boolean;
}) {
    const value = useWatch({
        control: form.control,
        name: `sections.${index}.content`,
    }) as { imageKey?: string; heading?: string; text?: string } | undefined;

    const setField = (
        key: "imageKey" | "heading" | "text",
        newValue: string
    ) => {
        const current =
            (form.getValues(`sections.${index}.content`) as {
                imageKey?: string;
                heading?: string;
                text?: string;
            }) ?? {};
        form.setValue(
            `sections.${index}.content`,
            { ...current, [key]: newValue } as never,
            { shouldDirty: true }
        );
    };

    return (
        <div className="space-y-4">
            <ImagePicker
                value={value?.imageKey ?? ""}
                onChange={(key) => setField("imageKey", key)}
                isPending={isPending}
            />

            <FormItem>
                <FormLabel>Heading (optional)</FormLabel>
                <FormControl>
                    <Input
                        value={value?.heading ?? ""}
                        onChange={(e) => setField("heading", e.target.value)}
                        placeholder="A short heading for this block"
                        disabled={isPending}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>

            <FormItem>
                <FormLabel>Text</FormLabel>
                <FormControl>
                    <AutosizeTextarea
                        value={value?.text ?? ""}
                        onChange={(e) => setField("text", e.target.value)}
                        placeholder="Write the body text..."
                        minHeight={120}
                        disabled={isPending}
                        className="resize-none"
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        </div>
    );
}

function KeyValueContent({
    form,
    index,
    isPending,
    label,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    isPending: boolean;
    label: string;
}) {
    const items = useWatch({
        control: form.control,
        name: `sections.${index}.content`,
    });

    const list = Array.isArray(items) ? items : [];

    const addItem = () => {
        const current = form.getValues(`sections.${index}.content`);
        if (Array.isArray(current)) {
            form.setValue(
                `sections.${index}.content`,
                [...current, { key: "", value: "" }],
                { shouldDirty: true }
            );
        }
    };

    const removeItem = (itemIndex: number) => {
        const current = form.getValues(`sections.${index}.content`);
        if (Array.isArray(current)) {
            form.setValue(
                `sections.${index}.content`,
                current.filter((_, i) => i !== itemIndex),
                { shouldDirty: true }
            );
        }
    };

    const updateItem = (
        itemIndex: number,
        key: "key" | "value",
        newValue: string
    ) => {
        const current = form.getValues(`sections.${index}.content`);
        if (Array.isArray(current)) {
            const next = current.map((it, i) =>
                i === itemIndex
                    ? {
                          ...(it as { key: string; value: string }),
                          [key]: newValue,
                      }
                    : it
            );
            form.setValue(`sections.${index}.content`, next, {
                shouldDirty: true,
            });
        }
    };

    return (
        <div className="space-y-3">
            <Separator />
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2">
                {list.map((item, itemIndex) => {
                    const kv = item as { key: string; value: string };
                    return (
                        <div
                            key={`${index}-${itemIndex}`}
                            className="flex items-start gap-2"
                        >
                            <div className="grid flex-1 gap-2 sm:grid-cols-2">
                                <Input
                                    value={kv.key}
                                    onChange={(e) =>
                                        updateItem(
                                            itemIndex,
                                            "key",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Key"
                                    disabled={isPending}
                                />
                                <Input
                                    value={kv.value}
                                    onChange={(e) =>
                                        updateItem(
                                            itemIndex,
                                            "value",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Value"
                                    disabled={isPending}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive size-9 shrink-0"
                                onClick={() => removeItem(itemIndex)}
                                disabled={isPending}
                            >
                                <Icons.Close className="size-4" />
                            </Button>
                        </div>
                    );
                })}
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

function QuoteContent({
    form,
    index,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    isPending: boolean;
}) {
    const value = useWatch({
        control: form.control,
        name: `sections.${index}.content`,
    }) as { text?: string; author?: string; role?: string } | undefined;

    const setField = (key: "text" | "author" | "role", newValue: string) => {
        const current =
            (form.getValues(`sections.${index}.content`) as {
                text?: string;
                author?: string;
                role?: string;
            }) ?? {};
        form.setValue(
            `sections.${index}.content`,
            { ...current, [key]: newValue } as never,
            { shouldDirty: true }
        );
    };

    return (
        <div className="space-y-4">
            <FormItem>
                <FormLabel>Quote</FormLabel>
                <FormControl>
                    <AutosizeTextarea
                        value={value?.text ?? ""}
                        onChange={(e) => setField("text", e.target.value)}
                        placeholder="The text of the quote..."
                        minHeight={100}
                        disabled={isPending}
                        className="resize-none"
                    />
                </FormControl>
                <FormMessage />
            </FormItem>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormItem>
                    <FormLabel>Author (optional)</FormLabel>
                    <FormControl>
                        <Input
                            value={value?.author ?? ""}
                            onChange={(e) => setField("author", e.target.value)}
                            placeholder="e.g., Jane Doe"
                            disabled={isPending}
                        />
                    </FormControl>
                </FormItem>

                <FormItem>
                    <FormLabel>Role (optional)</FormLabel>
                    <FormControl>
                        <Input
                            value={value?.role ?? ""}
                            onChange={(e) => setField("role", e.target.value)}
                            placeholder="e.g., Founder"
                            disabled={isPending}
                        />
                    </FormControl>
                </FormItem>
            </div>
        </div>
    );
}

function CtaContent({
    form,
    index,
    isPending,
}: {
    form: UseFormReturn<FormValues>;
    index: number;
    isPending: boolean;
}) {
    const value = useWatch({
        control: form.control,
        name: `sections.${index}.content`,
    }) as
        | {
              heading?: string;
              description?: string;
              buttonText?: string;
              buttonLink?: string;
          }
        | undefined;

    const setField = (
        key: "heading" | "description" | "buttonText" | "buttonLink",
        newValue: string
    ) => {
        const current =
            (form.getValues(`sections.${index}.content`) as {
                heading?: string;
                description?: string;
                buttonText?: string;
                buttonLink?: string;
            }) ?? {};
        form.setValue(
            `sections.${index}.content`,
            { ...current, [key]: newValue } as never,
            { shouldDirty: true }
        );
    };

    return (
        <div className="space-y-4">
            <FormItem>
                <FormLabel>Heading</FormLabel>
                <FormControl>
                    <Input
                        value={value?.heading ?? ""}
                        onChange={(e) => setField("heading", e.target.value)}
                        placeholder="e.g., Ready to start?"
                        disabled={isPending}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>

            <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                    <AutosizeTextarea
                        value={value?.description ?? ""}
                        onChange={(e) =>
                            setField("description", e.target.value)
                        }
                        placeholder="Short supporting copy..."
                        minHeight={80}
                        disabled={isPending}
                        className="resize-none"
                    />
                </FormControl>
            </FormItem>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormItem>
                    <FormLabel>Button Text</FormLabel>
                    <FormControl>
                        <Input
                            value={value?.buttonText ?? ""}
                            onChange={(e) =>
                                setField("buttonText", e.target.value)
                            }
                            placeholder="e.g., Book a call"
                            disabled={isPending}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <FormItem>
                    <FormLabel>Button Link</FormLabel>
                    <FormControl>
                        <Input
                            value={value?.buttonLink ?? ""}
                            onChange={(e) =>
                                setField("buttonLink", e.target.value)
                            }
                            placeholder="e.g., /booking"
                            disabled={isPending}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </div>
        </div>
    );
}
