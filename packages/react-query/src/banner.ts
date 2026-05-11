import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Banner,
    BANNER_MEDIA_TYPES,
    BannerContent,
    cFetch,
    CreateBanner,
    CreateBannerContent,
    handleClientError,
    ReorderBanner,
    UpdateBanner,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useBanner() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Banner[]>({
        ids,
        mediaType,
        isActive,
        initialData,
        enabled,
    }: {
        ids?: string[];
        mediaType?: (typeof BANNER_MEDIA_TYPES)[number];
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["banner", "scan", ids, mediaType, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (mediaType) searchParams.append("mediaType", mediaType);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/banners?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Banner>>({
        limit,
        page,
        search,
        mediaType,
        isActive,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        mediaType?: (typeof BANNER_MEDIA_TYPES)[number];
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "banner",
                "paginate",
                limit,
                page,
                search,
                mediaType,
                isActive,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (mediaType) searchParams.append("mediaType", mediaType);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/banners?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            ...(initialData && !search && !mediaType && isActive === undefined
                ? { initialData }
                : {}),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled,
        });
    };

    const useGet = <T extends Banner>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["banner", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/banners/${id}`);
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
                const toastId = toast.loading("Creating banner(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreateBanner[]) => {
                const res = await cFetch<Banner[]>(`/api/banners`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, _, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["banner"] });
                toast.success("Banner(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/banners");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating banner...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateBanner;
            }) => {
                const res = await cFetch<Banner>(`/api/banners/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["banner"] });
                toast.success("Banner updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/banners");
            },
            onError: handleClientError,
        });
    };

    const useReorder = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving banner order...");
                return { toastId };
            },
            mutationFn: async ({ values }: { values: ReorderBanner }) => {
                const res = await cFetch<Banner[]>(`/api/banners/reorder`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["banner"] });
                toast.success("Banner order saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting banner...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/banners?${searchParams.toString()}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["banner"] });
                toast.success("Banner(s) deleted successfully!", {
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
        useDelete,
    };
}

export function useBannerContent() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useGet = <T extends BannerContent>({
        initialData,
        enabled,
    }: {
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["banner", "content"],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/banners/content`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating banner content...");
                return { toastId };
            },
            mutationFn: async (values: CreateBannerContent) => {
                const res = await cFetch<BannerContent>(
                    `/api/banners/content`,
                    {
                        method: "POST",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({
                    queryKey: ["banner", "content"],
                });
                toast.success("Banner content updated successfully!", {
                    id: toastId,
                });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    return { useGet, useUpdate };
}
