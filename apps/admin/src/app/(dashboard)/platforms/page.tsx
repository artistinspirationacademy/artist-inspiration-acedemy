import {
    PlatformReorderDialog,
    PlatformTable,
} from "@/components/dashboard/platforms";
import { DashShell } from "@/components/globals/layouts";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Platforms",
    description: "Manage the platforms where students find the academy",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Platforms</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Where students find and book the academy (AIA, Urban
                        Pro, …)
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <PlatformReorderDialog />

                    <Button asChild>
                        <Link href={"/platforms/create"}>
                            <Icons.Plus />
                            New Platform
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <PlatformTable />
            </Suspense>
        </DashShell>
    );
}
