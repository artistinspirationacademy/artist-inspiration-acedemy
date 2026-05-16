import { DashShell } from "@/components/globals/layouts";
import {
    FeatureReorderDialog,
    FeatureTable,
} from "@/components/dashboard/features";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Features",
    description: "Manage the homepage feature highlights",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Features</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Highlight what makes your platform unique on the home
                        page
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <FeatureReorderDialog />

                    <Button asChild>
                        <Link href={"/features/create"}>
                            <Icons.Plus />
                            New Feature
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <FeatureTable />
            </Suspense>
        </DashShell>
    );
}
