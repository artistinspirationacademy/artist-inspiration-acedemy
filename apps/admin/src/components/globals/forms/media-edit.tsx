"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Media, UpdateMedia, updateMediaSchema } from "@workspace/config";
import { useMedia } from "@workspace/rq";
import { Resolver, useForm } from "react-hook-form";

interface PageProps {
    data: Media;
    onSuccess?: (values?: Media) => void;
    onClose?: () => void;
}

export function MediaEditForm({ data, onSuccess, onClose }: PageProps) {
    const mediaName = data.name.split(".").slice(0, -1).join(".");
    const mediaType = data.name.split(".").pop();

    const form = useForm<UpdateMedia>({
        resolver: zodResolver(
            updateMediaSchema
        ) as unknown as Resolver<UpdateMedia>,
        defaultValues: {
            name: mediaName,
            alt: data.alt ?? "",
        },
    });

    const { useUpdate } = useMedia();
    const { mutateAsync: updateMedia, isPending: isUpdating } = useUpdate();

    const handleSubmit = async (values: UpdateMedia) => {
        await updateMedia({
            id: data.id,
            values: {
                ...values,
                name: `${values.name}.${mediaType}`,
            },
        });
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>

                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Enter name"
                                    disabled={isUpdating}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="alt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Alt</FormLabel>

                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Enter alt"
                                    value={field.value || ""}
                                    disabled={isUpdating}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="reset"
                            variant="ghost"
                            disabled={isUpdating}
                            onClick={() => onClose?.()}
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        type="submit"
                        disabled={isUpdating || !form.formState.isDirty}
                    >
                        Update
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
