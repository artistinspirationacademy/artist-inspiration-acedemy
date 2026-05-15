import { TeachersPage } from "@/components/teachers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Teachers",
    description:
        "Meet the working practitioners guiding every cohort at Artist Inspiration Academy.",
};

export default function Page() {
    return <TeachersPage />;
}
