import { useMutation } from "@tanstack/react-query";
import {
    Booking,
    cFetch,
    CreateBooking,
    handleClientError,
} from "@workspace/config";
import { toast } from "sonner";

export function useBooking() {
    const useCreate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Submitting your booking...");
                return { toastId };
            },
            mutationFn: async (values: CreateBooking[]) => {
                const res = await cFetch<Booking[]>("/api/bookings", {
                    method: "POST",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success(
                    "Booking received! We'll reach out to confirm shortly.",
                    { id: toastId }
                );
            },
            onError: handleClientError,
        });
    };

    return { useCreate };
}
