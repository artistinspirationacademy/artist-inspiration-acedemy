import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    Configuration,
    handleClientError,
    UpdateConfiguration,
} from "@workspace/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useConfiguration() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const useGet = <T extends Configuration>({
        initialData,
        enabled,
    }: {
        initialData?: T;
        enabled?: boolean;
    } = {}) => {
        return useQuery({
            queryKey: ["configuration"],
            queryFn: async () => {
                const res = await cFetch<T | null>(`/api/configuration`);
                if (!res.ok) throw res.error;
                return res.data;
            },
            initialData,
            enabled,
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Saving configuration...");
                return { toastId };
            },
            mutationFn: async (values: UpdateConfiguration) => {
                const res = await cFetch<Configuration>(`/api/configuration`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                queryClient.invalidateQueries({ queryKey: ["configuration"] });
                queryClient.invalidateQueries({ queryKey: ["home"] });
                toast.success("Configuration saved!", { id: toastId });
                router.refresh();
            },
            onError: handleClientError,
        });
    };

    return { useGet, useUpdate };
}
