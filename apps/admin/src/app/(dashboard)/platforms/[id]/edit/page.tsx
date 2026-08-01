import { PlatformFetch } from "@/components/globals/forms";
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

    const existingData = await queries.platform.get({ id });
    if (!existingData)
        return {
            title: "Platform Not Found",
            description: `No platform found with ID ${id}`,
        };

    return {
        title: `Edit Platform '${existingData.name}'`,
        description: `Edit details for platform '${existingData.name}'`,
    };
}

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Edit Platform</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Update platform details
                    </p>
                </div>
            </div>

            <Suspense>
                <PlatformFetch type="edit" />
            </Suspense>
        </DashShell>
    );
}
