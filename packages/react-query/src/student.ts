"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    BulkUpdateStudent,
    cFetch,
    CreateStudent,
    handleClientError,
    Student,
    UpdateStudent,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useStudent() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Student[]>({
        ids,
        teacherId,
        courseId,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        ids?: string[];
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "enrollments";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "student",
                "scan",
                ids,
                teacherId,
                courseId,
                isActive,
                include,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (teacherId) searchParams.append("teacherId", teacherId);
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/students?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Student>>({
        limit,
        page,
        search,
        teacherId,
        courseId,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        teacherId?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "enrollments";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "student",
                "paginate",
                limit,
                page,
                search,
                teacherId,
                courseId,
                isActive,
                include,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (teacherId) searchParams.append("teacherId", teacherId);
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/students?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            ...(initialData &&
            !search &&
            !teacherId &&
            !courseId &&
            isActive === undefined
                ? { initialData }
                : {}),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled,
        });
    };

    const useGet = <T extends Student>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["student", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/students/${id}`);
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
                const toastId = toast.loading("Creating student(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreateStudent[]) => {
                const res = await cFetch<Student[]>(`/api/students`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["student"] });
                queryClient.invalidateQueries({ queryKey: ["attendance"] });
                toast.success("Student(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/students");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating student...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
                redirect = true,
            }: {
                id: string;
                values: UpdateStudent;
                redirect?: boolean;
            }) => {
                const res = await cFetch<Student>(`/api/students/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return { data: res.data, redirect };
            },
            onSuccess: ({ redirect }, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["student"] });
                queryClient.invalidateQueries({ queryKey: ["attendance"] });
                toast.success("Student updated successfully!", { id: toastId });
                router.refresh();
                if (redirect) router.push("/students");
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating students...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: BulkUpdateStudent;
            }) => {
                const res = await cFetch<Student[]>(`/api/students`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["student"] });
                queryClient.invalidateQueries({ queryKey: ["attendance"] });
                toast.success(
                    `${data?.length ?? 0} student(s) updated successfully!`,
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
                const toastId = toast.loading("Deleting student...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/students?${searchParams.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["student"] });
                queryClient.invalidateQueries({ queryKey: ["attendance"] });
                toast.success("Student(s) deleted successfully!", {
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
