"use client";

import {
    cFetch,
    handleClientError,
    Media,
    ResponseData,
    UpdateMedia,
    UploadMedia,
} from "@workspace/config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useMedia() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Media[]>({
        ids,
        type,
        initialData,
    }: {
        ids?: string[];
        type?: string;
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["media", "scan", ids, type],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (type) searchParams.append("type", type);
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/media?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
        });
    };

    const usePaginate = <T extends PaginationResult<Media>>({
        limit,
        page,
        search,
        type,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        type?: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["media", "paginate", limit, page, search, type],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (type) searchParams.append("type", type);
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/media?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            ...(initialData && !type && !search ? { initialData } : {}),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled,
        });
    };

    const useGet = <T extends Media>({
        id,
        initialData,
    }: {
        id: string;
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["media", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/media/${id}`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
        });
    };

    const useCreate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading(
                    "Uploading media, please DO NOT refresh or leave the page..."
                );
                return { toastId };
            },
            mutationFn: async (values: UploadMedia) => {
                const formData = new FormData();

                for (const file of values.files) {
                    formData.append("files", file, file.name);
                }

                const res = await fetch("/api/media", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.longMessage || "Upload failed");
                }

                const responseData: ResponseData<Media[]> = await res.json();
                return responseData.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["media"] });
                toast.success("Media uploaded!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating media...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateMedia;
            }) => {
                const res = await cFetch<Media>(`/api/media/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["media"] });
                toast.success("Media updated!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting media...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/media?${searchParams.toString()}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["media"] });
                toast.success("Media deleted!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    return { useScan, usePaginate, useGet, useCreate, useUpdate, useDelete };
}
