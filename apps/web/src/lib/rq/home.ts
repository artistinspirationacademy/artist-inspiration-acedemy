import { useQuery } from "@tanstack/react-query";
import { cFetch, Home } from "@workspace/config";

export function useHome() {
    const useGet = <T extends Home>({ enabled }: { enabled?: boolean }) => {
        return useQuery({
            queryKey: ["home"],
            queryFn: async () => {
                const res = await cFetch<T>("/api/home");
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
        });
    };

    return { useGet };
}
