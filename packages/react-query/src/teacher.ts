import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreateTeacher,
    handleClientError,
    ReorderTeacher,
    Teacher,
    UpdateTeacher,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useTeacher() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Teacher[]>({
        ids,
        courseId,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
        include?: "courses";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["teacher", "scan", ids, courseId, isActive, include],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/teachers?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Teacher>>({
        limit,
        page,
        search,
        courseId,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "courses";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "teacher",
                "paginate",
                limit,
                page,
                search,
                courseId,
                isActive,
                include,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/teachers?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            ...(initialData && !search && !courseId && isActive === undefined
                ? { initialData }
                : {}),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled,
        });
    };

    const useGet = <T extends Teacher>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["teacher", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/teachers/${id}`);
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
                const toastId = toast.loading("Creating teacher(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreateTeacher[]) => {
                const res = await cFetch<Teacher[]>(`/api/teachers`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["teacher"] });
                toast.success("Teacher(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/teachers");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating teacher...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateTeacher;
            }) => {
                const res = await cFetch<Teacher>(`/api/teachers/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["teacher"] });
                toast.success("Teacher updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/teachers");
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating teachers...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: UpdateTeacher;
            }) => {
                const res = await cFetch<Teacher[]>(`/api/teachers`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["teacher"] });
                toast.success(
                    `${data?.length ?? 0} teacher(s) updated successfully!`,
                    { id: toastId }
                );
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useReorder = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving teacher order...");
                return { toastId };
            },
            mutationFn: async ({ values }: { values: ReorderTeacher }) => {
                const res = await cFetch<Teacher[]>(`/api/teachers/reorder`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["teacher"] });
                toast.success("Teacher order saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting teacher...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/teachers?${searchParams.toString()}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["teacher"] });
                toast.success("Teacher(s) deleted successfully!", {
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
        useReorder,
        useDelete,
    };
}
