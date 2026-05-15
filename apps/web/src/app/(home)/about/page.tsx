import { AboutPage } from "@/components/about";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: "The story behind Artist Inspiration Academy.",
};

export default function Page() {
    return <AboutPage />;
}
