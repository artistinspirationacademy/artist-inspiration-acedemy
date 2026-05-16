import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreateTestimonial,
    FullTestimonial,
    handleClientError,
    ReorderTestimonial,
    Testimonial,
    UpdateTestimonial,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useTestimonial() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends FullTestimonial[]>({
        ids,
        courseId,
        isActive,
        initialData,
        enabled,
    }: {
        ids?: string[];
        courseId?: string;
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["testimonial", "scan", ids, courseId, isActive],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/testimonials?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<FullTestimonial>>({
        limit,
        page,
        search,
        courseId,
        isActive,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "testimonial",
                "paginate",
                limit,
                page,
                search,
                courseId,
                isActive,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());
                if (search) searchParams.append("search", search);
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/testimonials?${searchParams.toString()}`
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

    const useGet = <T extends FullTestimonial>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["testimonial", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/testimonials/${id}`);
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
                const toastId = toast.loading("Creating testimonial(s)...");
                return { toastId };
            },
            mutationFn: async (values: CreateTestimonial[]) => {
                const res = await cFetch<Testimonial[]>(`/api/testimonials`, {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["testimonial"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Testimonial(s) created successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/testimonials");
            },
            onError: handleClientError,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating testimonial...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateTestimonial;
            }) => {
                const res = await cFetch<Testimonial>(
                    `/api/testimonials/${id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["testimonial"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Testimonial updated successfully!", {
                    id: toastId,
                });
                router.refresh();
                router.push("/testimonials");
            },
            onError: handleClientError,
        });
    };

    const useReorder = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving testimonial order...");
                return { toastId };
            },
            mutationFn: async ({ values }: { values: ReorderTestimonial }) => {
                const res = await cFetch<Testimonial[]>(
                    `/api/testimonials/reorder`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(values),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["testimonial"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Testimonial order saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating testimonials...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                values,
            }: {
                ids: string[];
                values: UpdateTestimonial;
            }) => {
                const res = await cFetch<Testimonial[]>(`/api/testimonials`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, values }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["testimonial"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success(
                    `${data?.length ?? 0} testimonial(s) updated successfully!`,
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
                const toastId = toast.loading("Deleting testimonial...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/testimonials?${searchParams.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["testimonial"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Testimonial(s) deleted successfully!", {
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
