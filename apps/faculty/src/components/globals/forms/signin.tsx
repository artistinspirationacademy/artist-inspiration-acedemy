"use client";

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
import { PasswordInput } from "@/components/ui/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { FacultySignIn, facultySignInSchema } from "@workspace/config";
import { useFacultyAuth } from "@workspace/rq";
import { useForm } from "react-hook-form";

export function SignInForm() {
    const form = useForm<FacultySignIn>({
        resolver: zodResolver(facultySignInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { useSignIn } = useFacultyAuth();
    const { mutateAsync, isPending } = useSignIn();

    const onSubmit = async (values: FacultySignIn) => {
        await mutateAsync(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
            >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>

                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="you@example.com"
                                        disabled={isPending}
                                        value={field.value || ""}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>

                                <FormControl>
                                    <PasswordInput
                                        {...field}
                                        placeholder="**********"
                                        disabled={isPending}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-3">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        Login
                    </Button>

                    <p className="text-muted-foreground text-center text-xs">
                        Forgot your password? Ask the academy team to set a new
                        one for you.
                    </p>
                </div>
            </form>
        </Form>
    );
}
