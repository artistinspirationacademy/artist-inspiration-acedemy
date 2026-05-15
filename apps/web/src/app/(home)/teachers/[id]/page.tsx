import { TeacherProfileFetch } from "@/components/teachers";
import { cache } from "@workspace/cache";
import { Metadata } from "next";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: RouteContext): Promise<Metadata> {
    const { id } = await params;

    const teacher = await cache.teacher.byId(id);
    if (!teacher || !teacher.isActive)
        return {
            title: "Mentor not found",
            description: "This mentor could not be found.",
        };

    return {
        title: teacher.name,
        description: teacher.about.slice(0, 160),
    };
}

export default function Page() {
    return <TeacherProfileFetch />;
}
