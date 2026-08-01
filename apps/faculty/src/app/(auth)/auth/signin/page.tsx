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
    description: "Sign in to the faculty portal",
};

export default function Page() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold md:text-2xl">
                    Faculty Login
                </CardTitle>
                <CardDescription>
                    Sign in with the email the academy registered for you.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <SignInForm />
            </CardContent>
        </Card>
    );
}
