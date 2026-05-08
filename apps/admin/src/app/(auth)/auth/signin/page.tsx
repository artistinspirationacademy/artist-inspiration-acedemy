import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your existing account",
};

export default function Page() {
    return (
        <div className="w-full max-w-xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold md:text-3xl">Login</h1>

                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/auth/signup"
                        className="text-primary hover:underline"
                    >
                        Create one here
                    </Link>
                    .
                </p>
            </div>

            {/* <SignInForm /> */}
        </div>
    );
}
