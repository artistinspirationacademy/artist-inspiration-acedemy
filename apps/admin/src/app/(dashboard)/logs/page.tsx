import { LogsView } from "@/components/dashboard/logs";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Logs",
    description: "Recent system activity and archived log files",
};

export default function Page() {
    return (
        <DashShell classNames={{ innerWrapper: "max-w-6xl" }}>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Logs</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Hot logs live in Redis; older buckets are archived to
                        UploadThing on a schedule.
                    </p>
                </div>
            </div>

            <Suspense>
                <LogsView />
            </Suspense>
        </DashShell>
    );
}
