"use client";

import { useNavbarStore } from "@/lib/store";
import { cn, Icons, siteConfig } from "@workspace/config";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
    const [isMenuHidden, setIsMenuHidden] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    const isMenuOpen = useNavbarStore((state) => state.isOpen);
    const setIsMenuOpen = useNavbarStore((state) => state.setIsOpen);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 200) setIsMenuHidden(true);
        else setIsMenuHidden(false);
        setHasScrolled(latest > 24);
    });

    return (
        <motion.header
            variants={{ visible: { y: 0 }, hidden: { y: "-110%" } }}
            animate={isMenuHidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            data-menu-open={isMenuOpen}
            data-scrolled={hasScrolled}
            className={cn(
                "fixed inset-x-0 top-0 z-50 flex w-full items-center justify-center",
                "px-3 py-3 sm:px-6 sm:py-4",
                "transition-colors duration-300 ease-out",
                hasScrolled
                    ? "bg-background/70 supports-backdrop-filter:bg-background/20 border-b border-white/5 backdrop-blur-xl"
                    : "bg-transparent"
            )}
        >
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-2.5 transition-opacity hover:opacity-90",
                        "text-white"
                    )}
                >
                    <Image
                        src="/aia.png"
                        alt="AIA Logo"
                        width={36}
                        height={36}
                        className="size-8 sm:size-9"
                    />
                    <span className="hidden text-base font-bold tracking-tight sm:inline sm:text-lg">
                        {siteConfig.name}
                    </span>
                </Link>

                <ul className="hidden items-center gap-1 md:flex">
                    {siteConfig.menu.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                target={item.isExternal ? "_blank" : undefined}
                                rel={
                                    item.isExternal
                                        ? "noreferrer noopener"
                                        : undefined
                                }
                                className={cn(
                                    "group relative inline-flex items-center px-4 py-2",
                                    "text-sm font-medium text-white/90",
                                    "transition-colors duration-200 hover:text-white"
                                )}
                            >
                                {item.name}
                                <span
                                    aria-hidden
                                    className="bg-highlight absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/booking"
                        className={cn(
                            "group hidden h-10 items-center gap-2 rounded-full px-5 sm:inline-flex",
                            "bg-highlight text-highlight-foreground text-sm font-semibold",
                            "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30",
                            "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                        )}
                    >
                        Book Now
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>

                    <button
                        type="button"
                        aria-label="Toggle menu"
                        aria-pressed={isMenuOpen}
                        className={cn(
                            "inline-flex size-10 items-center justify-center rounded-full md:hidden",
                            "text-white transition-colors hover:bg-white/10"
                        )}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Icons.List className="size-5" />
                    </button>
                </div>
            </nav>
        </motion.header>
    );
}
