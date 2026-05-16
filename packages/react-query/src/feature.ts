import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreateFeature,
    Feature,
    handleClientError,
    ReorderFeature,
    UpdateFeature,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useFeature() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Feature[]>({
        ids,
        isActive,
        initialData,
        enabled,
    }: {
        ids?: string[];
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["feature", "scan", ids, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/features?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Feature>>({
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
            queryKey: ["feature", "paginate", limit, page, search, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/features?${searchParams.toString()}`
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

    const useGet = <T extends Feature>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["feature", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/features/${id}`);
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
                const toastId = toast.loading("Creating feature(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreateFeature[]) => {
                const res = await cFetch<Feature[]>(`/api/features`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["feature"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Feature(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/features");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating feature...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateFeature;
            }) => {
                const res = await cFetch<Feature>(`/api/features/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["feature"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Feature updated successfully!", { id: toastId });
                router.refresh();
                router.push("/features");
            },
            onError: handleClientError,
        });
    };

    const useReorder = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving feature order...");
                return { toastId };
            },
            mutationFn: async ({ values }: { values: ReorderFeature }) => {
                const res = await cFetch<Feature[]>(`/api/features/reorder`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["feature"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Feature order saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating features...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: UpdateFeature;
            }) => {
                const res = await cFetch<Feature[]>(`/api/features`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["feature"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success(
                    `${data?.length ?? 0} feature(s) updated successfully!`,
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
                const toastId = toast.loading("Deleting feature...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/features?${searchParams.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["feature"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Feature(s) deleted successfully!", {
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
