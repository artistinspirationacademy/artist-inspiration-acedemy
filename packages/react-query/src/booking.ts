import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Booking,
    cFetch,
    FullBooking,
    handleClientError,
    UpdateBooking,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useBooking() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useScan = <T extends Booking[]>({
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
        include?: "course";
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["booking", "scan", ids, courseId, isActive, include],
            queryFn: async () => {
                const searchParams = new URLSearchParams();
                if (ids) searchParams.append("ids", ids.join(","));
                if (courseId) searchParams.append("courseId", courseId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (include) searchParams.append("include", include);
                searchParams.append("isPaginated", "false");

                const res = await cFetch<T>(
                    `/api/bookings?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const usePaginate = <T extends PaginationResult<FullBooking>>({
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
                "booking",
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
                searchParams.append("include", "course");
                searchParams.append("isPaginated", "true");

                const res = await cFetch<T>(
                    `/api/bookings?${searchParams.toString()}`
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

    const useGet = <T extends FullBooking>({
        id,
        initialData,
        enabled,
    }: {
        id: string;
        initialData?: T;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["booking", "get", id],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/bookings/${id}`);
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
                const toastId = toast.loading("Updating booking...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateBooking;
            }) => {
                const res = await cFetch<Booking>(`/api/bookings/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["booking"] });
                toast.success("Booking updated successfully!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    const useDelete = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting booking...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const searchParams = new URLSearchParams();
                searchParams.append("ids", ids.join(","));

                const res = await cFetch(
                    `/api/bookings?${searchParams.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["booking"] });
                toast.success("Booking(s) deleted successfully!", {
                    id: toastId,
                });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    return { useScan, usePaginate, useGet, useUpdate, useDelete };
}
