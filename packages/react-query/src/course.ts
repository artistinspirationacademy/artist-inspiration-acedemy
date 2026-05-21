import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    BulkUpdateCourse,
    cFetch,
    Course,
    CourseCategory,
    CreateCourse,
    CreateCourseCategory,
    FullCourse,
    handleClientError,
    ReorderCourseCategory,
    UpdateCourse,
    UpdateCourseCategory,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCourse() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Course[]>({
        ids,
        courseCategoryId,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        ids?: string[];
        courseCategoryId?: string;
        isActive?: boolean;
        include?: "details";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "course",
                "scan",
                ids,
                courseCategoryId,
                isActive,
                include,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (courseCategoryId)
                    searchParams.append("courseCategoryId", courseCategoryId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/courses?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<Course>>({
        limit,
        page,
        search,
        courseCategoryId,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseCategoryId?: string;
        isActive?: boolean;
        include?: "details";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "course",
                "paginate",
                limit,
                page,
                search,
                courseCategoryId,
                isActive,
                include,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (courseCategoryId)
                    searchParams.append("courseCategoryId", courseCategoryId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/courses?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            ...(initialData &&
            !search &&
            !courseCategoryId &&
            isActive === undefined
                ? { initialData }
                : {}),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled,
        });
    };

    const useGet = <T extends FullCourse>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["course", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/courses/${id}`);
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
                const toastId = toast.loading("Creating course(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreateCourse[]) => {
                const res = await cFetch<FullCourse[]>(`/api/courses`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Course(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/courses");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating course...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateCourse;
            }) => {
                const res = await cFetch<FullCourse>(`/api/courses/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Course updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/courses");
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating courses...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: BulkUpdateCourse;
            }) => {
                const res = await cFetch<Course[]>(`/api/courses`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success(
                    `${data?.length ?? 0} course(s) updated successfully!`,
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
                const toastId = toast.loading("Deleting course...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/courses?${searchParams.toString()}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Course(s) deleted successfully!", {
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

export function useCourseCategory() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends CourseCategory[]>({
        ids,
        isActive,
        include,
        initialData,
        enabled,
    }: {
        ids?: string[];
        isActive?: boolean;
        include?: "courses";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["course-category", "scan", ids, isActive, include],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/courses/categories?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<CourseCategory>>({
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
            queryKey: [
                "course-category",
                "paginate",
                limit,
                page,
                search,
                isActive,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/courses/categories?${searchParams.toString()}`
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

    const useGet = <T extends CourseCategory>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["course-category", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/courses/categories/${id}`);
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
                const toastId = toast.loading("Creating category...");
                return { toastId };
            },
            mutationFn: async (values: CreateCourseCategory[]) => {
                const res = await cFetch<CourseCategory[]>(
                    `/api/courses/categories`,
                    {
                        method: "POST",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course-category"] });
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Category created successfully!", {
                    id: toastId,
                });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating category...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateCourseCategory;
            }) => {
                const res = await cFetch<CourseCategory>(
                    `/api/courses/categories/${id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course-category"] });
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Category updated successfully!", {
                    id: toastId,
                });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useReorder = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving category order...");
                return { toastId };
            },
            mutationFn: async ({
                values,
            }: {
                values: ReorderCourseCategory;
            }) => {
                const res = await cFetch<CourseCategory[]>(
                    `/api/courses/categories/reorder`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course-category"] });
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Category order saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting category...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/courses/categories?${searchParams.toString()}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["course-category"] });
                queryClient.invalidateQueries({ queryKey: ["course"] });
                toast.success("Category deleted successfully!", {
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
