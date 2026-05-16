import { DashboardView } from "@/components/dashboard/home";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Overview of activity across the platform",
};

export default function Page() {
    return (
        <DashShell classNames={{ innerWrapper: "max-w-7xl" }}>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Activity across courses, bookings and content
                    </p>
                </div>
            </div>

            <Suspense>
                <DashboardView />
            </Suspense>
        </DashShell>
    );
}
