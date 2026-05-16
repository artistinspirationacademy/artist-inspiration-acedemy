import { ConfigurationFetch } from "@/components/globals/forms";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Configuration",
    description: "Site-wide configuration and feature toggles",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Configuration</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Site-wide counters and feature toggles
                    </p>
                </div>
            </div>

            <Suspense>
                <ConfigurationFetch />
            </Suspense>
        </DashShell>
    );
}
