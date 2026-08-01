"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createFacultyAccountSchema,
    generatePassword,
    Icons,
    TeacherWithAccount,
} from "@workspace/config";
import { useFacultyAccount } from "@workspace/rq";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";

export type AccountDialogMode = "create" | "email" | "password";

interface PageProps {
    data: TeacherWithAccount;
    mode: AccountDialogMode;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface AccountFormValues {
    email: string;
    password: string;
}

const COPY: Record<
    AccountDialogMode,
    { title: (name: string) => string; description: string; submit: string }
> = {
    create: {
        title: (name) => `Create faculty account for ${name}`,
        description:
            "Choose the login email and password. The credentials are emailed to the teacher, and the account works immediately.",
        submit: "Create & send credentials",
    },
    email: {
        title: (name) => `Change login email for ${name}`,
        description:
            "The teacher signs in with this address. Changing it does not affect their password.",
        submit: "Save",
    },
    password: {
        title: (name) => `Set a new password for ${name}`,
        description:
            "The old password stops working immediately, and the new credentials are emailed to the teacher.",
        submit: "Set password & send",
    },
};

export function TeacherAccountDialog({
    data,
    mode,
    isOpen,
    onOpenChange,
}: PageProps) {
    const schema =
        mode === "create"
            ? createFacultyAccountSchema
            : mode === "email"
              ? createFacultyAccountSchema.pick({ email: true })
              : createFacultyAccountSchema.pick({ password: true });

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(schema) as unknown as Resolver<AccountFormValues>,
        defaultValues: { email: data.account?.email ?? "", password: "" },
    });

    useEffect(() => {
        if (isOpen)
            form.reset({ email: data.account?.email ?? "", password: "" });
    }, [isOpen, data.account?.email, form]);

    const { useCreate, useUpdate } = useFacultyAccount();
    const { mutateAsync: createAccount, isPending: isCreating } = useCreate();
    const { mutateAsync: updateAccount, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const handleSubmit = async ({ email, password }: AccountFormValues) => {
        if (mode === "create")
            await createAccount({
                teacherId: data.id,
                values: { email, password },
            });
        else
            await updateAccount({
                teacherId: data.id,
                values: mode === "email" ? { email } : { password },
            });

        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{COPY[mode].title(data.name)}</DialogTitle>

                    <DialogDescription>
                        {COPY[mode].description}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        {mode !== "password" && (
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="teacher@example.com"
                                                disabled={isSubmitting}
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Use an address the teacher checks —
                                            the credentials are sent there.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {mode !== "email" && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Type or generate one"
                                                    className="font-mono"
                                                    disabled={isSubmitting}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    title="Generate a password"
                                                    disabled={isSubmitting}
                                                    onClick={() =>
                                                        form.setValue(
                                                            "password",
                                                            generatePassword(),
                                                            {
                                                                shouldValidate: true,
                                                            }
                                                        )
                                                    }
                                                >
                                                    <Icons.ArrowsClockwise className="size-4" />
                                                    <span className="sr-only">
                                                        Generate a password
                                                    </span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Shown in plain text so you can read
                                            it out to the teacher. At least 8
                                            characters with an uppercase letter,
                                            a lowercase letter, a digit and a
                                            special character.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isSubmitting}>
                                {COPY[mode].submit}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
