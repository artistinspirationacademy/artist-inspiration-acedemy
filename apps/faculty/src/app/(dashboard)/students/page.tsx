import { StudentTable } from "@/components/dashboard/students";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Students",
    description: "The students enrolled with you",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">My Students</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Names, IDs and terms are set by the academy — edit the
                        monthly figures on the attendance sheet
                    </p>
                </div>
            </div>

            <Suspense>
                <StudentTable />
            </Suspense>
        </DashShell>
    );
}
