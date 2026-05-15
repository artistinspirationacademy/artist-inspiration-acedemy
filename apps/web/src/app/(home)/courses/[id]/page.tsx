import { CourseDetailFetch } from "@/components/courses";
import { cache } from "@workspace/cache";
import { Metadata } from "next";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: RouteContext): Promise<Metadata> {
    const { id } = await params;

    const course = await cache.course.getById(id);
    if (!course || !course.isActive)
        return {
            title: "Course not found",
            description: "This course could not be found.",
        };

    return {
        title: course.title,
        description: course.description.slice(0, 160),
    };
}

export default function Page() {
    return <CourseDetailFetch />;
}
