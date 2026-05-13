import { CourseFetch } from "@/components/globals/forms";
import { DashShell } from "@/components/globals/layouts";
import { queries } from "@workspace/db";
import { Metadata } from "next";
import { Suspense } from "react";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: RouteContext): Promise<Metadata> {
    const { id } = await params;

    const existingData = await queries.course.get({ id });
    if (!existingData)
        return {
            title: "Course Not Found",
            description: `No course found with ID ${id}`,
        };

    return {
        title: `Edit Course '${existingData.title}'`,
        description: `Edit details for course '${existingData.title}'`,
    };
}

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Edit Course</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Update course details
                    </p>
                </div>
            </div>

            <Suspense>
                <CourseFetch type="edit" />
            </Suspense>
        </DashShell>
    );
}
