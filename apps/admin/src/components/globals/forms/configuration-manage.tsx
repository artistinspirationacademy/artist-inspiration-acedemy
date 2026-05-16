"use client";
"use no memo";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Configuration,
    UpdateConfiguration,
    updateConfigurationSchema,
} from "@workspace/config";
import { useConfiguration } from "@workspace/rq";
import { useState } from "react";
import { useForm, type Control, type FieldPath } from "react-hook-form";

type NumericFieldName = Extract<
    FieldPath<UpdateConfiguration>,
    | "learnerCount"
    | "teacherCount"
    | "contentHoursCount"
    | "countryCount"
    | "redisLogRetentionDays"
    | "archiveRetentionDays"
>;

const NUMERIC_FIELDS: {
    name: NumericFieldName;
    label: string;
    description: string;
    placeholder: string;
}[] = [
    {
        name: "learnerCount",
        label: "Active learners",
        description: "Total students enrolled across the academy.",
        placeholder: "e.g., 1200",
    },
    {
        name: "teacherCount",
        label: "Industry mentors",
        description: "Number of teachers / mentors on the platform.",
        placeholder: "e.g., 30",
    },
    {
        name: "contentHoursCount",
        label: "Hours of content",
        description: "Approximate total hours of recorded content.",
        placeholder: "e.g., 400",
    },
    {
        name: "countryCount",
        label: "Countries reached",
        description: "Number of countries students have booked from.",
        placeholder: "e.g., 45",
    },
];

const LOG_RETENTION_FIELDS: {
    name: NumericFieldName;
    label: string;
    description: string;
    placeholder: string;
}[] = [
    {
        name: "redisLogRetentionDays",
        label: "Redis hot window (days)",
        description:
            "How long recent logs stay in Redis before the cron archives them to UploadThing.",
        placeholder: "e.g., 7",
    },
    {
        name: "archiveRetentionDays",
        label: "Archive retention (days)",
        description:
            "How long archived log files stay in UploadThing before the cron deletes them.",
        placeholder: "e.g., 365",
    },
];

export function ConfigurationFetch() {
    const { useGet } = useConfiguration();
    const { data, isPending } = useGet({});

    if (isPending) return <ConfigurationFormSkeleton />;
    return <ConfigurationManageForm data={data ?? null} />;
}

function ConfigurationFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

export function ConfigurationManageForm({
    data,
}: {
    data: Configuration | null;
}) {
    const initialValues = {
        learnerCount: data?.learnerCount ?? 0,
        countryCount: data?.countryCount ?? 0,
        teacherCount: data?.teacherCount ?? 0,
        contentHoursCount: data?.contentHoursCount ?? 0,
        enableBooking: data?.enableBooking ?? true,
        redisLogRetentionDays: data?.redisLogRetentionDays ?? 7,
        archiveRetentionDays: data?.archiveRetentionDays ?? 365,
    };

    const form = useForm<UpdateConfiguration>({
        resolver: zodResolver(updateConfigurationSchema),
        defaultValues: initialValues,
    });

    const { useUpdate } = useConfiguration();
    const { mutateAsync: updateConfiguration, isPending: isSubmitting } =
        useUpdate();

    const handleSubmit = async (values: UpdateConfiguration) => {
        await updateConfiguration(values);
        form.reset(values);
    };

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Stats</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            These numbers power the stats strip on the public
                            home page.
                        </p>
                    </CardHeader>

                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        {NUMERIC_FIELDS.map((spec) => (
                            <IntegerField
                                key={spec.name}
                                control={form.control}
                                name={spec.name}
                                label={spec.label}
                                description={spec.description}
                                placeholder={spec.placeholder}
                                disabled={isSubmitting}
                                initialValue={initialValues[spec.name]}
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Log Retention</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Control how long logs stay hot in Redis and how long
                            archives stay in UploadThing.
                        </p>
                    </CardHeader>

                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        {LOG_RETENTION_FIELDS.map((spec) => (
                            <IntegerField
                                key={spec.name}
                                control={form.control}
                                name={spec.name}
                                label={spec.label}
                                description={spec.description}
                                placeholder={spec.placeholder}
                                disabled={isSubmitting}
                                initialValue={initialValues[spec.name]}
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Feature Toggles</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Turn parts of the public site on or off without
                            redeploying.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="enableBooking"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Enable bookings</FormLabel>
                                        <FormDescription>
                                            When off, the public booking form
                                            and API will reject new bookings.
                                            Existing bookings are unaffected.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? true}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <FormFooterBar
                    visible={form.formState.isDirty}
                    isSubmitting={isSubmitting}
                    saveLabel="Save configuration"
                    savingLabel="Saving..."
                    cancelLabel="Discard"
                    message="You have unsaved changes"
                    onCancel={() => form.reset(initialValues)}
                />
            </form>
        </Form>
    );
}

function IntegerField({
    control,
    name,
    label,
    description,
    placeholder,
    disabled,
    initialValue,
}: {
    control: Control<UpdateConfiguration>;
    name: NumericFieldName;
    label: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    initialValue: number;
}) {
    const [text, setText] = useState<string>(() => String(initialValue));

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder={placeholder}
                            disabled={disabled}
                            value={text}
                            onChange={(e) => {
                                const cleaned = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                );
                                const normalised =
                                    cleaned.length > 1
                                        ? cleaned.replace(/^0+/, "") || "0"
                                        : cleaned;
                                setText(normalised);
                                field.onChange(
                                    normalised === "" ? 0 : Number(normalised)
                                );
                            }}
                            onBlur={() => {
                                if (text === "") {
                                    setText("0");
                                    field.onChange(0);
                                }
                                field.onBlur();
                            }}
                            name={field.name}
                        />
                    </FormControl>
                    {description && (
                        <FormDescription>{description}</FormDescription>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
