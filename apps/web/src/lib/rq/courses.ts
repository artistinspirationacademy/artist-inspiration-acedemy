import { useQuery } from "@tanstack/react-query";
import { cFetch, CoursesPage } from "@workspace/config";

export function useCourses() {
    const useGet = <T extends CoursesPage>({
        enabled,
    }: {
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["courses"],
            queryFn: async () => {
                const res = await cFetch<T>("/api/courses");
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
        });
    };

    return { useGet };
}
