"use client";

import { cn, Icons } from "@workspace/config";
import { motion } from "motion/react";
import Link from "next/link";

export function CtaSection() {
    return (
        <section className="relative overflow-hidden bg-neutral-950 px-4 py-20 text-white sm:px-6 sm:py-28">
            <div className="bg-highlight/10 pointer-events-none absolute bottom-0 left-0 size-96 -translate-x-1/3 translate-y-1/3 rounded-full blur-3xl" />
            <div className="bg-highlight/8 pointer-events-none absolute top-1/3 right-0 size-112 translate-x-1/4 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-7 text-center"
            >
                <span
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1",
                        "text-xs font-semibold tracking-[0.25em] text-white/90 uppercase backdrop-blur-md"
                    )}
                >
                    <Icons.Sparkle
                        weight="fill"
                        className="text-highlight size-3"
                    />
                    Ready when you are
                </span>

                <h2 className="text-4xl leading-[1.05] font-bold text-balance sm:text-5xl md:text-6xl">
                    Stop watching tutorials.{" "}
                    <span className="relative inline-block">
                        <span
                            aria-hidden
                            className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                        />
                        <span className="text-highlight">Start shipping.</span>
                    </span>
                </h2>

                <p className="max-w-xl text-base text-balance text-white/75 sm:text-lg">
                    Book a free 15-minute call and we&apos;ll help you pick the
                    program that fits where you are right now.
                </p>

                <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                    <Link
                        href="/booking"
                        className={cn(
                            "group inline-flex h-12 items-center gap-2 rounded-full px-7",
                            "bg-highlight text-highlight-foreground font-semibold",
                            "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40",
                            "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                        )}
                    >
                        Book a Free Call
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>

                    <Link
                        href="/courses"
                        className={cn(
                            "inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7",
                            "font-semibold text-white backdrop-blur-md",
                            "transition-all duration-300 ease-out hover:bg-white/15",
                            "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                        )}
                    >
                        Browse Courses
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
