import { DashboardView } from "@/components/dashboard/home";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Your students and this month's attendance",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        This month&apos;s attendance across your students
                    </p>
                </div>
            </div>

            <Suspense>
                <DashboardView />
            </Suspense>
        </DashShell>
    );
}
