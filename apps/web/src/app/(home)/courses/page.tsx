import { CoursesPage } from "@/components/courses";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Courses",
    description:
        "Project-driven courses taught by working artists. Pick a track and start building.",
};

export default function Page() {
    return <CoursesPage />;
}
