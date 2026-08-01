import { AttendanceView } from "@/components/dashboard/attendance";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Attendance",
    description: "Mark and review your monthly attendance sheet",
};

export default function Page() {
    return (
        <DashShell classNames={{ innerWrapper: "max-w-full" }}>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Attendance</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Mark each class day for your students, month by month
                    </p>
                </div>
            </div>

            <Suspense>
                <AttendanceView />
            </Suspense>
        </DashShell>
    );
}
