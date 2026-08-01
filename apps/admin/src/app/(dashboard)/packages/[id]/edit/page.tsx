import { PackageFetch } from "@/components/globals/forms";
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

    const existingData = await queries.package.get({ id });
    if (!existingData)
        return {
            title: "Package Not Found",
            description: `No package found with ID ${id}`,
        };

    return {
        title: `Edit Package '${existingData.name}'`,
        description: `Edit details for package '${existingData.name}'`,
    };
}

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Edit Package</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Update package details
                    </p>
                </div>
            </div>

            <Suspense>
                <PackageFetch type="edit" />
            </Suspense>
        </DashShell>
    );
}
