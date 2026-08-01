import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreatePlatform,
    handleClientError,
    Platform,
    ReorderPlatform,
    UpdatePlatform,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function usePlatform() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Platform[]>({
        ids,
        isActive,
        initialData,
        enabled,
    }: {
        ids?: string[];
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    } = {}) => {
        return useQuery({
            queryKey: ["platform", "scan", ids, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/platforms?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Platform>>({
        limit,
        page,
        search,
        isActive,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["platform", "paginate", limit, page, search, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/platforms?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            ...(initialData && !search && isActive === undefined
                ? { initialData }
                : {}),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled,
        });
    };

    const useGet = <T extends Platform>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["platform", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/platforms/${id}`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const useCreate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Creating platform(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreatePlatform[]) => {
                const res = await cFetch<Platform[]>(`/api/platforms`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["platform"] });
                toast.success("Platform(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/platforms");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating platform...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdatePlatform;
            }) => {
                const res = await cFetch<Platform>(`/api/platforms/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["platform"] });
                toast.success("Platform updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/platforms");
            },
            onError: handleClientError,
        });
    };

    const useReorder = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving platform order...");
                return { toastId };
            },
            mutationFn: async ({ values }: { values: ReorderPlatform }) => {
                const res = await cFetch<Platform[]>(`/api/platforms/reorder`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["platform"] });
                toast.success("Platform order saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating platforms...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: UpdatePlatform;
            }) => {
                const res = await cFetch<Platform[]>(`/api/platforms`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["platform"] });
                toast.success(
                    `${data?.length ?? 0} platform(s) updated successfully!`,
                    { id: toastId }
                );
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting platform...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/platforms?${searchParams.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["platform"] });
                toast.success("Platform(s) deleted successfully!", {
                    id: toastId,
                });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    return {
        useScan,
        usePaginate,
        useGet,
        useCreate,
        useUpdate,
        useReorder,
        useBulkUpdate,
        useDelete,
    };
}
