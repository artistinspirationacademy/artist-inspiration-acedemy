import { BookingPage } from "@/components/booking";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book a Course",
    description:
        "Reserve your spot in a cohort. Pick a track, share your details, and we'll confirm your seat within 24 hours.",
};

export default function Page() {
    return <BookingPage />;
}
