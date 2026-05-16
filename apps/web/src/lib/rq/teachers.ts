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

export function useTeacher() {
    const useGet = ({ id, enabled }: { id: string; enabled?: boolean }) => {
        return useQuery({
            queryKey: ["teacher", "get", id],
            queryFn: async () => {
                const res = await cFetch<FullTeacher>(`/api/teachers/${id}`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled: enabled !== undefined ? enabled : !!id,
        });
    };

    return { useGet };
}
