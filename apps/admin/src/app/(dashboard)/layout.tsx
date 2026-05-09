import { ThemeButton } from "@/components/globals/buttons";
import { Sidebar, SidebarInset } from "@/components/globals/layouts";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset as ShadSidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Icons, siteConfig } from "@workspace/config";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Dashboard",
        template: "%s - Dashboard - " + siteConfig.name,
    },
    description: "Dashboard for the platform",
};

export default function Layout({ children }: RootLayoutProps) {
    return (
        <SidebarProvider>
            <Sidebar />

            <ShadSidebarInset className="max-w-full">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex w-full items-center justify-between gap-2 px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="hover:bg-muted hover:text-foreground -ml-1" />

                            <div>
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 h-4"
                                />
                            </div>

                            <SidebarInset />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="hover:bg-muted rounded-md p-1">
                                <Icons.Bell className="size-5" />
                            </button>

                            <ThemeButton className="rounded-md p-1" />
                        </div>
                    </div>
                </header>

                {children}
            </ShadSidebarInset>
        </SidebarProvider>
    );
}
