import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Bookings",
    description: "Manage the bookings on your platform",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Bookings</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Manage the bookings on your platform
                    </p>
                </div>
            </div>

            <Suspense></Suspense>
        </DashShell>
    );
}
