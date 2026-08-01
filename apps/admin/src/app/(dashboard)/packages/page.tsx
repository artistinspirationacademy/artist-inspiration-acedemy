import { PackageTable } from "@/components/dashboard/packages";
import { DashShell } from "@/components/globals/layouts";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Packages",
    description: "Manage the class packages students can be assigned",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Packages</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Class packages students can be assigned, e.g. 48 classes
                        until August
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <Button asChild>
                        <Link href={"/packages/create"}>
                            <Icons.Plus />
                            New Package
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <PackageTable />
            </Suspense>
        </DashShell>
    );
}
