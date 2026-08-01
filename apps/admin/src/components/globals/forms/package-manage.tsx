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
    CreatePackage,
    createPackageSchema,
    Package,
    UpdatePackage,
} from "@workspace/config";
import { usePackage } from "@workspace/rq";
import { redirect, useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface PageProps {
    data?: Package;
}

export function PackageFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = usePackage();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <PackageManageForm />;

    if (!id || typeof id !== "string") redirect("/packages");
    if (isPending) return <FeatureFormSkeleton />;
    if (!data) redirect("/packages");

    return <PackageManageForm data={data} />;
}

export function PackageManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const form = useForm<CreatePackage>({
        resolver: zodResolver(createPackageSchema),
        defaultValues: {
            name: data?.name ?? "",
            totalClasses: data?.totalClasses ?? 1,
            isActive: data?.isActive ?? true,
        },
    });

    const { useCreate, useUpdate } = usePackage();
    const { mutateAsync: createPackage, isPending: isCreating } = useCreate();
    const { mutateAsync: updatePackage, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const handleSubmit = async (values: CreatePackage) => {
        if (isEdit && data) {
            await updatePackage({
                id: data.id,
                values: values as UpdatePackage,
            });
        } else {
            await createPackage([values]);
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
                                                    placeholder="e.g., 48 classes until August"
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="totalClasses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Classes</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={field.value ?? 1}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ===
                                                                ""
                                                                ? 1
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  )
                                                        )
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
                                                    Inactive packages are hidden
                                                    from assignment.
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
                    saveLabel={isEdit ? "Update Package" : "Create Package"}
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New package — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/packages")}
                />
            </form>
        </Form>
    );
}
