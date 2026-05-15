import { useQuery } from "@tanstack/react-query";
import { cFetch, CoursesPage, FullCourse } from "@workspace/config";

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

export function useCourse() {
    const useGet = ({
        id,
        enabled,
    }: {
        id: string;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["course", "get", id],
            queryFn: async () => {
                const res = await cFetch<FullCourse>(`/api/courses/${id}`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled: enabled !== undefined ? enabled : !!id,
        });
    };

    return { useGet };
}
