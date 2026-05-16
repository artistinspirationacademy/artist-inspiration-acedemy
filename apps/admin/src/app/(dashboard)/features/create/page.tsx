import { FeatureFetch } from "@/components/globals/forms";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Create Feature",
    description: "Add a new feature to your home page",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Create Feature</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Add a new feature to your home page
                    </p>
                </div>
            </div>

            <Suspense>
                <FeatureFetch type="create" />
            </Suspense>
        </DashShell>
    );
}
