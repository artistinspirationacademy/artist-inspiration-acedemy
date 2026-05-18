"use client";
"use no memo";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password";
import { ProfileSkeleton } from "@/components/globals/skeletons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    SafeUser,
    UpdateEmail,
    updateEmailSchema,
    UpdatePassword,
    updatePasswordSchema,
    UpdateProfile,
    updateProfileSchema,
} from "@workspace/config";
import { useAuth } from "@workspace/rq";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function ProfileFetch() {
    const { useCurrentUser } = useAuth();
    const { data, isPending } = useCurrentUser();

    if (isPending) return <ProfileSkeleton />;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <ProfileSummaryCard user={data} />
            <PersonalInfoForm user={data} />
            <EmailForm user={data} />
            <PasswordForm />
        </div>
    );
}

function ProfileSummaryCard({ user }: { user: SafeUser }) {
    const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`
        .trim()
        .toUpperCase();

    return (
        <Card>
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
                <div className="bg-muted text-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
                    {initials || "U"}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                        {user.firstName} {user.lastName}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                        {user.email}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function PersonalInfoForm({ user }: { user: SafeUser }) {
    const initial = {
        firstName: user.firstName,
        lastName: user.lastName,
    };

    const form = useForm<UpdateProfile>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: initial,
    });

    const { useUpdateProfile } = useAuth();
    const { mutateAsync: updateProfile, isPending: isSubmitting } =
        useUpdateProfile();

    const handleSubmit = async (values: UpdateProfile) => {
        await updateProfile(values);
        form.reset(values);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-muted-foreground text-sm">
                    Update your display name.
                </p>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="John"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Doe"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={
                                    isSubmitting || !form.formState.isDirty
                                }
                                onClick={() => form.reset(initial)}
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting || !form.formState.isDirty
                                }
                            >
                                {isSubmitting ? "Saving..." : "Save changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function EmailForm({ user }: { user: SafeUser }) {
    const form = useForm<UpdateEmail>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: {
            email: user.email,
            currentPassword: "",
        },
    });

    const { useUpdateEmail } = useAuth();
    const { mutateAsync: updateEmail, isPending: isSubmitting } =
        useUpdateEmail();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pending, setPending] = useState<UpdateEmail | null>(null);

    const onSubmit = (values: UpdateEmail) => {
        setPending(values);
        setIsConfirmOpen(true);
    };

    const confirm = async () => {
        if (!pending) return;
        setIsConfirmOpen(false);
        await updateEmail(pending);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email</CardTitle>
                <p className="text-muted-foreground text-sm">
                    Used for signing in. Changing it will sign you out.
                </p>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="you@example.com"
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            {...field}
                                            placeholder="**********"
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Required to confirm it&apos;s really
                                        you.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting || !form.formState.isDirty
                                }
                            >
                                {isSubmitting ? "Updating..." : "Update email"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            You&apos;ll be signed out after this
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Changing your email signs you out of this session.
                            You&apos;ll need to sign in again with{" "}
                            <span className="text-foreground font-medium">
                                {pending?.email}
                            </span>
                            . Continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirm}
                            disabled={isSubmitting}
                        >
                            Update & sign out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

function PasswordForm() {
    const form = useForm<UpdatePassword>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { useUpdatePassword } = useAuth();
    const { mutateAsync: updatePassword, isPending: isSubmitting } =
        useUpdatePassword();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pending, setPending] = useState<UpdatePassword | null>(null);

    const onSubmit = (values: UpdatePassword) => {
        setPending(values);
        setIsConfirmOpen(true);
    };

    const confirm = async () => {
        if (!pending) return;
        setIsConfirmOpen(false);
        await updatePassword(pending);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <p className="text-muted-foreground text-sm">
                    Use at least 8 characters, including a number and a symbol.
                    Changing it will sign you out.
                </p>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            {...field}
                                            placeholder="**********"
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New password</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                {...field}
                                                placeholder="**********"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Confirm new password
                                        </FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                {...field}
                                                placeholder="**********"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting || !form.formState.isDirty
                                }
                            >
                                {isSubmitting
                                    ? "Updating..."
                                    : "Update password"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            You&apos;ll be signed out after this
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Changing your password signs you out of this
                            session. You&apos;ll need to sign in again with your
                            new password. Continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirm}
                            disabled={isSubmitting}
                        >
                            Update & sign out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
