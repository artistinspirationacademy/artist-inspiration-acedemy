"use client";

import { useBooking } from "@workspace/rq";
import { parseAsString, useQueryState } from "nuqs";
import { BookingDetailsSheet } from "./booking-details-sheet";

export function BookingDeepLinkSheet() {
    const [bookingId, setBookingId] = useQueryState("bookingId", parseAsString);

    const { useGet } = useBooking();
    const { data: booking } = useGet({
        id: bookingId ?? "",
        enabled: !!bookingId,
    });

    if (!bookingId || !booking) return null;

    return (
        <BookingDetailsSheet
            booking={booking}
            isOpen={true}
            onOpenChange={(open) => {
                if (!open) setBookingId(null);
            }}
        />
    );
}
