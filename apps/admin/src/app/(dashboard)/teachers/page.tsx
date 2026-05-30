import {
    TeacherReorderDialog,
    TeacherTable,
} from "@/components/dashboard/teachers";
import { DashShell } from "@/components/globals/layouts";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Teachers",
    description: "Manage the teacher content",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Teachers</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Manage the teacher content of your platform
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <TeacherReorderDialog />

                    <Button asChild>
                        <Link href={"/teachers/create"}>
                            <Icons.Plus />
                            New Teacher
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <TeacherTable />
            </Suspense>
        </DashShell>
    );
}
