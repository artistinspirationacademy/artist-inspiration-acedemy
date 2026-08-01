import { MasterTable } from "@/components/dashboard/master";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Master Table",
    description: "Every enrollment on one editable screen",
};

export default function Page() {
    return (
        <DashShell classNames={{ innerWrapper: "max-w-full" }}>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Master Table</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Every enrollment on one screen — edit details inline
                        without opening each student
                    </p>
                </div>
            </div>

            <Suspense>
                <MasterTable />
            </Suspense>
        </DashShell>
    );
}
