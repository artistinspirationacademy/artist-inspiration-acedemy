import { MediaAddButton, MediaTable } from "@/components/dashboard/media";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Media",
    description: "Manage the media content",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Media</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Manage the media content of your platform
                    </p>
                </div>

                <Suspense>
                    <MediaAddButton />
                </Suspense>
            </div>

            <Suspense>
                <MediaTable />
            </Suspense>
        </DashShell>
    );
}
