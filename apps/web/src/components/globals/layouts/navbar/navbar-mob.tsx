"use client";

import { useNavbarStore } from "@/lib/store";
import { cn, Icons, siteConfig } from "@workspace/config";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function NavbarMob({ className, ...props }: GenericProps) {
    const isMenuOpen = useNavbarStore((state) => state.isOpen);
    const setIsMenuOpen = useNavbarStore((state) => state.setIsOpen);

    const navContainerRef = useRef<HTMLDivElement | null>(null);
    const navListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = isMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                navContainerRef.current?.contains(event.target as Node) &&
                !navListRef.current?.contains(event.target as Node)
            )
                setIsMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsMenuOpen]);

    return (
        <div
            aria-label="Mobile Menu"
            data-menu-open={isMenuOpen}
            ref={navContainerRef}
            className={cn(
                "fixed inset-0 z-40 mt-12 md:hidden",
                "transition-[opacity,visibility] duration-300 ease-out",
                isMenuOpen ? "visible opacity-100" : "invisible opacity-0",
                className
            )}
            {...props}
        >
            {/* Backdrop */}
            <div
                aria-hidden
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm",
                    "transition-opacity duration-300",
                    isMenuOpen ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Panel */}
            <div
                ref={navListRef}
                className={cn(
                    "absolute inset-x-3 top-3 rounded-2xl border border-white/10",
                    "bg-background/95 supports-backdrop-filter:bg-background/80 backdrop-blur-xl",
                    "p-4 shadow-2xl shadow-black/40",
                    "transition-all duration-300 ease-out",
                    isMenuOpen
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-4 opacity-0"
                )}
            >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold tracking-[0.25em] uppercase opacity-70">
                        Menu
                    </span>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="hover:bg-muted inline-flex size-9 items-center justify-center rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <Icons.Close className="size-4" />
                    </button>
                </div>

                <ul className="mt-2 space-y-1">
                    {siteConfig.menu.map((item, index) => {
                        const Icon = Icons[item.icon];
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    target={
                                        item.isExternal ? "_blank" : "_self"
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center justify-between gap-3 rounded-xl px-3 py-3",
                                        "text-base font-medium",
                                        "transition-colors hover:bg-white/5"
                                    )}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="text-muted-foreground size-5" />
                                        {item.name}
                                    </span>
                                    <Icons.ArrowRight
                                        weight="bold"
                                        className="text-muted-foreground size-4"
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <Link
                    href="/booking"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                        "group mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                        "bg-highlight text-highlight-foreground font-semibold",
                        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                    )}
                >
                    Book Now
                    <Icons.ArrowRight
                        weight="bold"
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>
        </div>
    );
}
