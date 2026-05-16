import { AboutFetch } from "@/components/globals/forms";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: "Manage the dynamic About page content",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">About page</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Add, reorder, and edit the sections shown on the public
                        About page.
                    </p>
                </div>
            </div>

            <AboutFetch />
        </DashShell>
    );
}
