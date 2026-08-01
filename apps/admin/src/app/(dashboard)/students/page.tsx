import { StudentTable } from "@/components/dashboard/students";
import { DashShell } from "@/components/globals/layouts";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Students",
    description: "Manage the students of your academy",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Students</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enroll students under a teacher and a course
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <Button asChild>
                        <Link href={"/students/create"}>
                            <Icons.Plus />
                            New Student
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <StudentTable />
            </Suspense>
        </DashShell>
    );
}
