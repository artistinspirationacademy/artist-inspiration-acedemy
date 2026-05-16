import { useQuery } from "@tanstack/react-query";
import { cFetch, DashboardStats } from "@workspace/config";

export function useDashboard() {
    const useStats = <T extends DashboardStats>({
        initialData,
        enabled,
    }: {
        initialData?: T;
        enabled?: boolean;
    } = {}) => {
        return useQuery({
            queryKey: ["dashboard", "stats"],
            queryFn: async () => {
                const res = await cFetch<T>(`/api/dashboard/stats`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
        });
    };

    return { useStats };
}
