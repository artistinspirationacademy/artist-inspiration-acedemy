import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    cFetch,
    DEFAULT_NOTIFICATION_POLL_MS,
    FullNotification,
    handleClientError,
    Notification,
    NotificationStatus,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useNotification() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useInfinite = ({
        status,
        limit = 10,
        enabled = true,
    }: {
        status: NotificationStatus;
        limit?: number;
        enabled?: boolean;
    }) => {
        return useInfiniteQuery({
            queryKey: ["notification", "infinite", status, limit],
            queryFn: async ({ pageParam = 1 }) => {
                const params = new URLSearchParams();
                params.set("status", status);
                params.set("limit", String(limit));
                params.set("page", String(pageParam));
                params.set("include", "booking");

                const res = await cFetch<PaginationResult<FullNotification>>(
                    `/api/notifications?${params.toString()}`
                );
                if (!res.ok) throw res.error;
                return { ...res.data, page: pageParam };
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                if (!lastPage) return undefined;
                return lastPage.page < lastPage.pages
                    ? lastPage.page + 1
                    : undefined;
            },
            enabled,
            refetchOnWindowFocus: false,
        });
    };

    const useUnreadCount = ({
        enabled = true,
        pollMs = DEFAULT_NOTIFICATION_POLL_MS,
    }: { enabled?: boolean; pollMs?: number } = {}) => {
        return useQuery({
            queryKey: ["notification", "unreadCount"],
            queryFn: async () => {
                const res = await cFetch<{ count: number }>(
                    `/api/notifications/count`
                );
                if (!res.ok) throw res.error;
                return res.data.count;
            },
            enabled,
            refetchInterval: pollMs,
            refetchOnWindowFocus: false,
            staleTime: pollMs / 2,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating notification...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                status,
            }: {
                id: string;
                status: NotificationStatus;
            }) => {
                const res = await cFetch<Notification>(
                    `/api/notifications/${id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({ status }),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["notification"] });
                toast.success("Notification updated", { id: toastId });
            },
            onError: handleClientError,
        });
    };

    const useBulkUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating notifications...");
                return { toastId };
            },
            mutationFn: async ({
                ids,
                status,
                scopeStatus,
            }: {
                ids?: string[];
                status: NotificationStatus;
                scopeStatus?: NotificationStatus;
            }) => {
                const res = await cFetch<Notification[]>(`/api/notifications`, {
                    method: "PATCH",
                    body: JSON.stringify({ ids, status, scopeStatus }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, _, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["notification"] });
                toast.success(
                    `${data?.length ?? 0} notification(s) updated`,
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
                const toastId = toast.loading("Deleting notification...");
                return { toastId };
            },
            mutationFn: async ({ ids }: { ids: string[] }) => {
                const params = new URLSearchParams();
                params.append("ids", ids.join(","));
                const res = await cFetch(
                    `/api/notifications?${params.toString()}`,
                    { method: "DELETE" }
                );
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["notification"] });
                toast.success("Notification(s) deleted", { id: toastId });
            },
            onError: handleClientError,
        });
    };

    return {
        useInfinite,
        useUnreadCount,
        useUpdate,
        useBulkUpdate,
        useDelete,
    };
}
