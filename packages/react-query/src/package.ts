import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreatePackage,
    handleClientError,
    Package,
    UpdatePackage,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function usePackage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Package[]>({
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
            queryKey: ["package", "scan", ids, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/packages?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Package>>({
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
            queryKey: ["package", "paginate", limit, page, search, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/packages?${searchParams.toString()}`
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

    const useGet = <T extends Package>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["package", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/packages/${id}`);
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
                const toastId = toast.loading("Creating package(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreatePackage[]) => {
                const res = await cFetch<Package[]>(`/api/packages`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["package"] });
                toast.success("Package(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/packages");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating package...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdatePackage;
            }) => {
                const res = await cFetch<Package>(`/api/packages/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["package"] });
                toast.success("Package updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/packages");
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating packages...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: UpdatePackage;
            }) => {
                const res = await cFetch<Package[]>(`/api/packages`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["package"] });
                toast.success(
                    `${data?.length ?? 0} package(s) updated successfully!`,
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
                const toastId = toast.loading("Deleting package...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/packages?${searchParams.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["package"] });
                toast.success("Package(s) deleted successfully!", {
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
        useBulkUpdate,
        useDelete,
    };
}
