import { Footer, Navbar, NavbarMob } from "@/components/globals/layouts";
import { siteConfig } from "@workspace/config";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: siteConfig.description + " - " + siteConfig.name,
        template: "%s - " + siteConfig.name,
    },
};

export default function Layout({ children }: RootLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <NavbarMob />
        </div>
    );
}
