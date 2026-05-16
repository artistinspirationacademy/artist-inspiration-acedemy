import {
    BannerContentSheet,
    BannerReorderDialog,
    BannerTable,
} from "@/components/dashboard/banners";
import { DashShell } from "@/components/globals/layouts";
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

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <BannerContentSheet />
                    <BannerReorderDialog />

                    <Button asChild>
                        <Link href={"/banners/create"}>
                            <Icons.Plus />
                            New Banner
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <BannerTable />
            </Suspense>
        </DashShell>
    );
}
