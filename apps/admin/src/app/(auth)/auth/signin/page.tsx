import { SignInForm } from "@/components/globals/forms";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your existing account",
};

export default function Page() {
    return (
        // <div className="w-full max-w-xl space-y-6">
        //     <div className="space-y-1">
        //         <h1 className="text-2xl font-bold md:text-3xl">Login</h1>

        //         <p className="text-sm text-muted-foreground">
        //             Sign in to your existing account to access your dashboard.
        //         </p>
        //     </div>

        //     <SignInForm />
        // </div>
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold md:text-2xl">
                    Login
                </CardTitle>
                <CardDescription>
                    Sign in to your existing account to access your dashboard.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <SignInForm />
            </CardContent>
        </Card>
    );
}
