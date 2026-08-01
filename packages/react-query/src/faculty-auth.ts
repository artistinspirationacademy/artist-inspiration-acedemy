"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    FacultySignIn,
    FullFacultyUser,
    handleClientError,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useFacultyAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useCurrentUser = ({
        initialData,
    }: { initialData?: FullFacultyUser } = {}) => {
        return useQuery({
            queryKey: ["faculty", "me"],
            queryFn: async () => {
                const res = await cFetch<FullFacultyUser>("/api/auth/me");
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
            mutationFn: async (values: FacultySignIn) => {
                const res = await cFetch<FullFacultyUser>("/api/auth/signin", {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                toast.success(`Welcome back, ${data.teacher.name}`, {
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
            onSuccess: (_, __, { toastId }) => {
                toast.success("See you next time!", { id: toastId });
                queryClient.clear();
                router.push("/auth/signin");
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
