import { DashShell } from "@/components/globals/layouts";
import {
    TestimonialReorderDialog,
    TestimonialTable,
} from "@/components/dashboard/testimonials";
import { Button } from "@/components/ui/button";
import { Icons } from "@workspace/config";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Testimonials",
    description: "Manage student testimonials",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Testimonials</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Showcase what students say about your courses
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 md:justify-end">
                    <TestimonialReorderDialog />

                    <Button asChild>
                        <Link href={"/testimonials/create"}>
                            <Icons.Plus />
                            New Testimonial
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense>
                <TestimonialTable />
            </Suspense>
        </DashShell>
    );
}
