import { useQuery } from "@tanstack/react-query";
import { cFetch, FullTeacher, Teacher } from "@workspace/config";

export function useTeachers() {
    const useGet = <T extends Teacher[] | FullTeacher[] = FullTeacher[]>({
        courseId,
        enabled,
    }: {
        courseId?: string;
        enabled?: boolean;
    } = {}) => {
        return useQuery({
            queryKey: ["teachers", { courseId: courseId ?? null }],
            queryFn: async () => {
                const search = new URLSearchParams();
                if (courseId) search.append("courseId", courseId);
                const qs = search.toString();
                const url = qs ? `/api/teachers?${qs}` : "/api/teachers";

                const res = await cFetch<T>(url);
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
        });
    };

    return { useGet };
}
