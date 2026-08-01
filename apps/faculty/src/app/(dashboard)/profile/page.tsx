import { ProfileFetch } from "@/components/globals/forms";
import { DashShell } from "@/components/globals/layouts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Profile",
    description: "Manage your account details",
};

export default function Page() {
    return (
        <DashShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Review your account details
                    </p>
                </div>
            </div>

            <Suspense>
                <ProfileFetch />
            </Suspense>
        </DashShell>
    );
}
