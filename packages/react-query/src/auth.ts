"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    handleClientError,
    SafeUser,
    SignIn,
    UpdateEmail,
    UpdatePassword,
    UpdateProfile,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useCurrentUser = ({
        initialData,
    }: { initialData?: SafeUser } = {}) => {
        return useQuery({
            queryKey: ["user", "me"],
            queryFn: async () => {
                const res = await cFetch<SafeUser>("/api/auth/me");
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

    const useUpdateProfile = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating profile...");
                return { toastId };
            },
            mutationFn: async (values: UpdateProfile) => {
                const res = await cFetch<SafeUser>("/api/auth/me", {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });

                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: async (data, __, { toastId }) => {
                queryClient.setQueryData(["user", "me"], data);
                toast.success("Profile updated", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useUpdateEmail = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating email...");
                return { toastId };
            },
            mutationFn: async (values: UpdateEmail) => {
                const res = await cFetch<SafeUser>("/api/auth/email", {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });

                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: async (_, __, { toastId }) => {
                toast.success(
                    "Email updated. Please sign in again with your new email.",
                    { id: toastId, duration: 6000 }
                );
                queryClient.clear();
                router.replace("/signin");
            },
            onError: handleClientError,
        });
    };

    const useUpdatePassword = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating password...");
                return { toastId };
            },
            mutationFn: async (values: UpdatePassword) => {
                const res = await cFetch<SafeUser>("/api/auth/password", {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });

                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: async (_, __, { toastId }) => {
                toast.success(
                    "Password updated. Please sign in again with your new password.",
                    { id: toastId, duration: 6000 }
                );
                queryClient.clear();
                router.replace("/signin");
            },
            onError: handleClientError,
        });
    };

    return {
        useCurrentUser,
        useSignIn,
        useSignOut,
        useUpdateProfile,
        useUpdateEmail,
        useUpdatePassword,
    };
}
