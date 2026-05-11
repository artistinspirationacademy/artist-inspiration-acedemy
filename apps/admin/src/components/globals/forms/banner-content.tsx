"use client";
"use no memo";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    BannerContent,
    CreateBannerContent,
    createBannerContentSchema,
} from "@workspace/config";
import { useBannerContent } from "@workspace/rq";
import { useForm } from "react-hook-form";

interface BannerContentFormProps {
    onSaved?: () => void;
}

export function BannerContentForm({ onSaved }: BannerContentFormProps) {
    const { useGet, useUpdate } = useBannerContent();
    const { data, isPending } = useGet({});
    const { mutateAsync: updateContent, isPending: isUpdating } = useUpdate();

    if (isPending) return <BannerContentFormSkeleton />;

    return (
        <BannerContentFormInner
            key={data?.id ?? "new"}
            data={data ?? null}
            onSubmit={async (values) => {
                await updateContent(values);
                onSaved?.();
            }}
            isUpdating={isUpdating}
        />
    );
}

function BannerContentFormSkeleton() {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-9 w-28" />
        </div>
    );
}

function BannerContentFormInner({
    data,
    onSubmit,
    isUpdating,
}: {
    data: BannerContent | null;
    onSubmit: (values: CreateBannerContent) => Promise<unknown>;
    isUpdating: boolean;
}) {
    const form = useForm<CreateBannerContent>({
        resolver: zodResolver(createBannerContentSchema),
        defaultValues: {
            title: data?.title ?? "",
            description: data?.description ?? "",
            content: data?.content ?? "",
        },
    });

    const handleSubmit = async (values: CreateBannerContent) => {
        await onSubmit(values);
        form.reset(values);
    };

    return (
        <Form {...form}>
            <form
                className="space-y-5"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Welcome to our platform"
                                    disabled={isUpdating}
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
                                    placeholder="Discover amazing content and get inspired by talented artists around the world."
                                    disabled={isUpdating}
                                    minHeight={64}
                                    maxHeight={160}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Learn, create, and share."
                                    disabled={isUpdating}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isUpdating || !form.formState.isDirty}
                    >
                        {isUpdating ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
