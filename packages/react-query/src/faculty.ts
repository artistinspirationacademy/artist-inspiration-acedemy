"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreateFacultyAccount,
    FacultyAccountResult,
    handleClientError,
    UpdateFacultyAccount,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * When email delivery is skipped the API hands back the portal URL, so the
 * toast becomes the delivery mechanism instead of the inbox: it shows the
 * credentials with a Copy button for the admin to pass along personally.
 */
function announceCredentials(
    data: FacultyAccountResult,
    password: string | undefined,
    toastId: string | number,
    deliveredMessage: string
) {
    if (!data.loginUrl || !password) {
        toast.success(deliveredMessage, { id: toastId });
        return;
    }

    const credentials = `Email: ${data.email}\nPassword: ${password}\nSign in: ${data.loginUrl}`;

    toast.success(
        `Email skipped — pass these credentials to ${data.email} yourself`,
        {
            id: toastId,
            description: credentials,
            duration: Infinity,
            action: {
                label: "Copy",
                onClick: () => navigator.clipboard.writeText(credentials),
            },
        }
    );
}

export function useFacultyAccount() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["teacher"] });
        router.refresh();
    };

    const useCreate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Creating faculty account...");
                return { toastId };
            },
            mutationFn: async ({
                teacherId,
                values,
            }: {
                teacherId: string;
                values: CreateFacultyAccount;
            }) => {
                const res = await cFetch<FacultyAccountResult>(
                    `/api/teachers/${teacherId}/account`,
                    {
                        method: "POST",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, { values }, { toastId }) => {
                announceCredentials(
                    data,
                    values.password,
                    toastId,
                    `Credentials emailed to ${data.email}`
                );
                invalidate();
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating faculty account...");
                return { toastId };
            },
            mutationFn: async ({
                teacherId,
                values,
            }: {
                teacherId: string;
                values: UpdateFacultyAccount;
            }) => {
                const res = await cFetch<FacultyAccountResult>(
                    `/api/teachers/${teacherId}/account`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, { values }, { toastId }) => {
                if (values.password)
                    announceCredentials(
                        data,
                        values.password,
                        toastId,
                        `New credentials emailed to ${data.email}`
                    );
                else toast.success("Faculty account updated!", { id: toastId });
                invalidate();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Revoking faculty account...");
                return { toastId };
            },
            mutationFn: async ({ teacherId }: { teacherId: string }) => {
                const res = await cFetch(`/api/teachers/${teacherId}/account`, {
                    method: "DELETE",
                });
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success("Faculty account revoked", { id: toastId });
                invalidate();
            },
            onError: handleClientError,
        });
    };

    return { useCreate, useUpdate, useDelete };
}
