"use client";
"use no memo";

import { FeatureFormSkeleton } from "@/components/globals/skeletons";
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
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CreatePlatform,
    createPlatformSchema,
    Platform,
    UpdatePlatform,
} from "@workspace/config";
import { usePlatform } from "@workspace/rq";
import { redirect, useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface PageProps {
    data?: Platform;
}

export function PlatformFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = usePlatform();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <PlatformManageForm />;

    if (!id || typeof id !== "string") redirect("/platforms");
    if (isPending) return <FeatureFormSkeleton />;
    if (!data) redirect("/platforms");

    return <PlatformManageForm data={data} />;
}

export function PlatformManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const form = useForm<CreatePlatform>({
        resolver: zodResolver(createPlatformSchema),
        defaultValues: {
            name: data?.name ?? "",
            isActive: data?.isActive ?? true,
        },
    });

    const { useCreate, useUpdate } = usePlatform();
    const { mutateAsync: createPlatform, isPending: isCreating } = useCreate();
    const { mutateAsync: updatePlatform, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const handleSubmit = async (values: CreatePlatform) => {
        if (isEdit && data) {
            await updatePlatform({
                id: data.id,
                values: values as UpdatePlatform,
            });
        } else {
            await createPlatform([values]);
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
                                                    placeholder="e.g., Urban Pro"
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
                                                    Inactive platforms are
                                                    hidden from selection.
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
                    </div>
                </div>

                <FormFooterBar
                    visible={!isEdit || form.formState.isDirty}
                    isSubmitting={isSubmitting}
                    saveLabel={isEdit ? "Update Platform" : "Create Platform"}
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New platform — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/platforms")}
                />
            </form>
        </Form>
    );
}
