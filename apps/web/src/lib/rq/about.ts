import { useQuery } from "@tanstack/react-query";
import { AboutSection, cFetch } from "@workspace/config";

export function useAbout() {
    const useGet = ({ enabled }: { enabled?: boolean } = {}) => {
        return useQuery({
            queryKey: ["about"],
            queryFn: async () => {
                const res = await cFetch<AboutSection[]>("/api/about");
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
        });
    };

    return { useGet };
}
