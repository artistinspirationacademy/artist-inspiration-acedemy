import { PlatformFetch } from "@/components/globals/forms";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Create Platform",
    description: "Add a new booking platform",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Create Platform</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Add a new booking platform
                    </p>
                </div>
            </div>

            <Suspense>
                <PlatformFetch type="create" />
            </Suspense>
        </DashShell>
    );
}
