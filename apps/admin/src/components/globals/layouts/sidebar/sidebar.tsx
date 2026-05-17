"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar as ShadSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    sidebarMenuButtonVariants,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    cn,
    DEFAULT_PFP_URL,
    getAbsoluteURL,
    Icons,
    siteConfig,
} from "@workspace/config";
import { useAuth } from "@workspace/rq";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    useEffect(() => {
        if (isMobile) setOpenMobile(false);
    }, [pathname, isMobile, setOpenMobile]);

    return (
        <ShadSidebar collapsible="icon">
            <SidebarHeader>
                <Header />
            </SidebarHeader>

            <SidebarContent style={{ scrollbarWidth: "none" }}>
                <SideNav />
            </SidebarContent>

            <SidebarFooter>
                <SideUser />
            </SidebarFooter>
        </ShadSidebar>
    );
}

function Header() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="hover:text-sidebar-foreground active:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent active:bg-transparent"
                    asChild
                >
                    <Link href="/">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                            <Image
                                src="/icon1.png"
                                alt="AIA Logo"
                                width={35}
                                height={35}
                            />
                        </div>

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {siteConfig.name}
                            </span>
                            <span className="truncate text-xs">
                                {getAbsoluteURL().split("://")[1]?.slice(0, -1)}
                            </span>
                        </div>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function SideNav({ className, ...props }: GenericProps) {
    return (
        <SidebarGroup className={cn("", className)} {...props}>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {siteConfig.sidebar.map((item) => {
                    const Icon = item.icon && Icons[item.icon];

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {Icon && <Icon />}
                                        <span>{item.title}</span>
                                        <Icons.CaretRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        href={subItem.url}
                                                        prefetch
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function SideUser() {
    const { useCurrentUser, useSignOut } = useAuth();
    const { data: user } = useCurrentUser();
    const { mutate: signOut, isPending: isSigningOut } = useSignOut();

    return (
        <SidebarMenu>
            <SidebarMenuItem
                className={cn(sidebarMenuButtonVariants({ size: "lg" }))}
            >
                {user ? (
                    <>
                        <Avatar className="size-8">
                            <AvatarImage
                                src={DEFAULT_PFP_URL}
                                alt={user.firstName}
                            />
                            <AvatarFallback>
                                {user.firstName[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="truncate text-xs">Admin</span>
                        </div>
                    </>
                ) : (
                    <>
                        <Skeleton className="size-8 rounded-full" />

                        <div className="grid flex-1 gap-px text-left text-sm leading-tight">
                            <Skeleton className="h-4 w-20 rounded-lg" />
                            <Skeleton className="h-3 w-16 rounded-lg" />
                        </div>
                    </>
                )}

                <button
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSigningOut}
                    onClick={() => signOut({})}
                >
                    <Icons.SignOut className="ml-auto size-4" />
                    <span className="sr-only">Log out</span>
                </button>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
