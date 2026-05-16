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
import { FormFooterBar } from "@/components/ui/form-footer-bar";
import { Input } from "@/components/ui/input";
import { MediaSelectModal } from "@/components/ui/media-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CreateFeature,
    createFeatureSchema,
    Feature,
    generateUploadThingURL,
    Icons,
    Media,
    UpdateFeature,
} from "@workspace/config";
import { useFeature } from "@workspace/rq";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

interface PageProps {
    data?: Feature;
}

export function FeatureFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useFeature();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <FeatureManageForm />;

    if (!id || typeof id !== "string") redirect("/features");
    if (isPending) return <FeatureFormSkeleton />;
    if (!data) redirect("/features");

    return <FeatureManageForm data={data} />;
}

function FeatureFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
}

export function FeatureManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

    const form = useForm<CreateFeature>({
        resolver: zodResolver(createFeatureSchema),
        defaultValues: {
            name: data?.name ?? "",
            description: data?.description ?? "",
            imageKey: data?.imageKey ?? "",
            isActive: data?.isActive ?? true,
        },
    });

    const { useCreate, useUpdate } = useFeature();
    const { mutateAsync: createFeature, isPending: isCreating } = useCreate();
    const { mutateAsync: updateFeature, isPending: isUpdating } = useUpdate();

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

    const handleSubmit = async (values: CreateFeature) => {
        if (isEdit && data) {
            await updateFeature({
                id: data.id,
                values: values as UpdateFeature,
            });
        } else {
            await createFeature([values]);
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
                                                    placeholder="e.g., World-class mentors"
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <AutosizeTextarea
                                                    {...field}
                                                    placeholder="Briefly describe this feature..."
                                                    rows={4}
                                                    disabled={isSubmitting}
                                                />
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
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active</FormLabel>
                                                <FormDescription>
                                                    Inactive features are hidden
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
                                <CardTitle>Feature Image</CardTitle>
                                <p className="text-muted-foreground text-xs">
                                    Square images work best for the feature
                                    grid.
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
                                                                alt="Feature preview"
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

                <FormFooterBar
                    visible={!isEdit || form.formState.isDirty}
                    isSubmitting={isSubmitting}
                    saveDisabled={!imageKey}
                    saveLabel={isEdit ? "Update Feature" : "Create Feature"}
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New feature — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/features")}
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
        </Form>
    );
}
