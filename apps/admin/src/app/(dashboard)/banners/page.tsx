import { DashShell } from "@/components/globals/layouts";
import { BannerTable } from "@/components/dashboard/banners";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Banners",
    description: "Manage the banner content",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Banners</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Manage the banner content of your platform
                    </p>
                </div>

                <Button size="sm" asChild>
                    <Link href={"/banners/create"}>
                        <Icons.Plus />
                        New Banner
                    </Link>
                </Button>
            </div>

            <Suspense>
                <BannerTable />
            </Suspense>
        </DashShell>
    );
}
