import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AboutSection,
    cFetch,
    CreateAboutSection,
    handleClientError,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAbout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useGet = ({ enabled }: { enabled?: boolean } = {}) => {
        return useQuery({
            queryKey: ["about"],
            queryFn: async () => {
                const res = await cFetch<AboutSection[]>(`/api/about`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
        });
    };

    const useReplace = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving About page...");
                return { toastId };
            },
            mutationFn: async (sections: CreateAboutSection[]) => {
                const res = await cFetch<AboutSection[]>(`/api/about`, {
                    method: "PUT",
                    body: JSON.stringify({ sections }),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["about"] });
                toast.success("About page saved successfully!", {
                    id: toastId,
                });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    return { useGet, useReplace };
}
