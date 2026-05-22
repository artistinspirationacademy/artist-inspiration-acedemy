import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    handleClientError,
    LogArchive,
    LogEntry,
    LogType,
} from "@workspace/config";
import { toast } from "sonner";

export function useLogs() {
    const queryClient = useQueryClient();

    const useRecent = ({
        type,
        limit = 100,
        enabled,
    }: {
        type?: LogType;
        limit?: number;
        enabled?: boolean;
    } = {}) => {
        return useQuery({
            queryKey: ["logs", "recent", type, limit],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (type) params.set("type", type);
                params.set("limit", String(limit));
                const res = await cFetch<LogEntry[]>(
                    `/api/logs/recent?${params.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
            refetchInterval: 1000 * 30,
            refetchOnWindowFocus: false,
        });
    };

    const useArchives = <
        T extends PaginationResult<LogArchive>,
    >({
        limit,
        page,
        initialData,
        enabled,
    }: {
        limit?: number;
        page?: number;
        initialData?: T;
        enabled?: boolean;
    } = {}) => {
        return useQuery({
            queryKey: ["logs", "archives", limit, page],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (limit) params.set("limit", String(limit));
                if (page) params.set("page", String(page));
                const res = await cFetch<T>(
                    `/api/logs/archives?${params.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
            refetchOnWindowFocus: false,
        });
    };

    const useRunArchive = () => {
        type ArchiveResult = {
            uploaded: { key: string; name: string; entries: number }[];
            emptyBucketsDropped: number;
            archivesExpired: number;
        };
        return useMutation<ArchiveResult | null, unknown, void, { toastId: string | number }>({
            onMutate: () => {
                const toastId = toast.loading("Running archive job...");
                return { toastId };
            },
            mutationFn: async () => {
                const res = await cFetch<ArchiveResult>(
                    `/api/logs/run-archive`,
                    { method: "POST" }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, _, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["logs"] });
                const n = data?.uploaded.length ?? 0;
                toast.success(
                    n === 0
                        ? "Nothing to archive yet"
                        : `Archived ${n} bucket(s)`,
                    { id: toastId }
                );
            },
            onError: handleClientError,
        });
    };

    return { useRecent, useArchives, useRunArchive };
}
