"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { cFetch, handleClientError, SafeUser, SignIn } from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
    const router = useRouter();

    const useCurrentUser = ({
        initialData,
    }: { initialData?: SafeUser } = {}) => {
        return useQuery({
            queryKey: ["user", "me"],
            queryFn: async () => {
                const res = await cFetch<SafeUser>("/users/me");
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
        });
    };

    const useSignIn = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Signing in...");
                return { toastId };
            },
            mutationFn: async (values: SignIn) => {
                const res = await cFetch<SafeUser>("/api/auth/signin", {
                    method: "POST",
                    body: JSON.stringify(values),
                });

                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: async (data, __, { toastId }) => {
                toast.success(`Welcome back, ${data.firstName}`, {
                    id: toastId,
                });
                router.push("/");
            },
            onError: handleClientError,
        });
    };

    const useSignOut = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Signing out...");
                return { toastId };
            },
            mutationFn: async () => {
                const res = await cFetch("/api/auth/signout", {
                    method: "POST",
                });

                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: async (_, __, { toastId }) => {
                toast.success("See you next time!", { id: toastId });
                router.push("/signin");
            },
            onError: handleClientError,
        });
    };

    return {
        useCurrentUser,
        useSignIn,
        useSignOut,
    };
}
