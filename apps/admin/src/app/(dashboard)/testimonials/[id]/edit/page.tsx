import { TestimonialFetch } from "@/components/globals/forms";
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

    const existingData = await queries.testimonial.get({ id });
    if (!existingData)
        return {
            title: "Testimonial Not Found",
            description: `No testimonial found with ID ${id}`,
        };

    return {
        title: `Edit Testimonial — ${existingData.name}`,
        description: `Edit testimonial from ${existingData.name}`,
    };
}

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Edit Testimonial</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Update testimonial details
                    </p>
                </div>
            </div>

            <Suspense>
                <TestimonialFetch type="edit" />
            </Suspense>
        </DashShell>
    );
}
