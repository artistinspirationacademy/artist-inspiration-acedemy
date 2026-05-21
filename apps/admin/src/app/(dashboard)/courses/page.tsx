import {
    CourseCategoryReorderDialog,
    CourseCategorySheet,
    CourseTable,
} from "@/components/dashboard/courses";
import { DashShell } from "@/components/globals/layouts";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Courses",
    description: "Manage the courses content",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Courses</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Manage the courses content of your platform
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <CourseCategorySheet />
                    <CourseCategoryReorderDialog />

                    <Button asChild>
                        <Link href={"/courses/create"}>
                            <Icons.Plus />
                            New Course
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <CourseTable />
            </Suspense>
        </DashShell>
    );
}
