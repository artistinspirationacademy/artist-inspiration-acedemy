"use client";
"use no memo";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CourseCategory,
    CreateCourseCategory,
    createCourseCategorySchema,
    Icons,
    slugify,
} from "@workspace/config";
import { useCourseCategory } from "@workspace/rq";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function CourseCategorySheet() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <Icons.Folder />
                    Categories
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
            >
                <SheetHeader className="border-b p-6">
                    <SheetTitle>Course Categories</SheetTitle>
                    <SheetDescription>
                        Create, edit, and delete the categories that group your
                        courses.
                    </SheetDescription>
                </SheetHeader>

                {isOpen && <CourseCategorySheetBody />}
            </SheetContent>
        </Sheet>
    );
}

function CourseCategorySheetBody() {
    const [editingCategory, setEditingCategory] =
        useState<CourseCategory | null>(null);

    const { useScan } = useCourseCategory();
    const { data, isPending } = useScan({});

    return (
        <ScrollArea className="flex-1">
            <div className="space-y-6 p-6">
                <CategoryForm
                    key={editingCategory?.id ?? "new"}
                    editing={editingCategory}
                    onFinish={() => setEditingCategory(null)}
                />

                <Separator />

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">
                        Existing categories
                    </h3>

                    {isPending ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton
                                    key={`cat-skeleton-${i}`}
                                    className="h-14 w-full"
                                />
                            ))}
                        </div>
                    ) : !data?.length ? (
                        <p className="text-muted-foreground py-6 text-center text-sm">
                            No categories yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {data.map((category) => (
                                <CategoryRow
                                    key={category.id}
                                    category={category}
                                    onEdit={() => setEditingCategory(category)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}

function CategoryForm({
    editing,
    onFinish,
}: {
    editing: CourseCategory | null;
    onFinish: () => void;
}) {
    const isEdit = !!editing;

    const form = useForm<CreateCourseCategory>({
        resolver: zodResolver(createCourseCategorySchema),
        defaultValues: {
            name: editing?.name ?? "",
            slug: editing?.slug ?? "",
            isActive: editing?.isActive ?? true,
        },
    });

    const { useCreate, useUpdate } = useCourseCategory();
    const { mutateAsync: createCategory, isPending: isCreating } = useCreate();
    const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const handleSubmit = async (values: CreateCourseCategory) => {
        if (isEdit && editing) {
            await updateCategory({ id: editing.id, values });
        } else {
            await createCategory([values]);
        }
        form.reset({ name: "", slug: "", isActive: true });
        onFinish();
    };

    return (
        <Form {...form}>
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <h3 className="text-sm font-semibold">
                    {isEdit ? "Edit category" : "Create category"}
                </h3>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Painting"
                                    disabled={isSubmitting}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        if (
                                            !isEdit &&
                                            !form.getFieldState("slug").isDirty
                                        ) {
                                            form.setValue(
                                                "slug",
                                                slugify(e.target.value),
                                                { shouldValidate: false }
                                            );
                                        }
                                    }}
                                />
                            </FormControl>
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
                                    Inactive categories are hidden from the
                                    public site.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value ?? false}
                                    onCheckedChange={field.onChange}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    {isEdit && (
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isSubmitting}
                            onClick={() => {
                                form.reset({
                                    name: "",
                                    slug: "",
                                    isActive: true,
                                });
                                onFinish();
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting || !form.formState.isDirty}
                    >
                        {isEdit ? "Update category" : "Create category"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CategoryRow({
    category,
    onEdit,
}: {
    category: CourseCategory;
    onEdit: () => void;
}) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { useDelete } = useCourseCategory();
    const { mutateAsync, isPending } = useDelete();

    const handleDelete = async () => {
        await mutateAsync({ ids: [category.id] });
        setIsDeleteOpen(false);
    };

    return (
        <li className="bg-background flex items-center justify-between gap-2 rounded-md border p-3">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                        {category.name}
                    </p>
                    {category.isActive ? (
                        <Badge>Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                </div>
                <p className="text-muted-foreground truncate font-mono text-xs">
                    {category.slug}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={onEdit}
                >
                    <Icons.PencilSimple className="size-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive size-8"
                    onClick={() => setIsDeleteOpen(true)}
                >
                    <Icons.Trash className="size-4" />
                </Button>
            </div>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete &ldquo;{category.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Deleting this category will fail if any courses are
                            still assigned to it. Move those courses first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </li>
    );
}
