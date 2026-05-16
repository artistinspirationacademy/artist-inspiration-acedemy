"use client";

import { cn, Icons } from "@workspace/config";
import { motion } from "motion/react";
import { SectionHeader } from "./features-section";

const STEPS: {
    title: string;
    description: string;
    icon: keyof typeof Icons;
}[] = [
    {
        title: "Pick your path",
        description:
            "Browse the catalog and find the program that matches where you are and where you want to go.",
        icon: "Book",
    },
    {
        title: "Learn from real artists",
        description:
            "Live cohorts, recorded sessions, and 1-on-1 mentor reviews from people who've shipped real work.",
        icon: "Teacher",
    },
    {
        title: "Build your portfolio",
        description:
            "Every course ends in a public-ready deliverable — a track, a brand, a release plan, a launch.",
        icon: "Sparkle",
    },
];

export function HowItWorksSection() {
    return (
        <section className="relative overflow-hidden bg-neutral-950 px-4 py-20 sm:px-6 sm:py-28">
            <div className="bg-highlight/8 pointer-events-none absolute top-1/2 left-0 size-112 -translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-14">
                <SectionHeader
                    eyebrow="How it works"
                    title="Three steps to a portfolio you're proud of"
                    description="No fluff. No filler. Each step builds toward something you can show."
                />

                <div className="relative grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="bg-highlight/30 pointer-events-none absolute top-12 right-12 left-12 hidden h-px md:block" />

                    {STEPS.map((step, i) => {
                        const IconComponent = Icons[step.icon];
                        return (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.55,
                                    ease: "easeOut",
                                    delay: 0.1 + i * 0.12,
                                }}
                                className="relative flex flex-col items-start gap-4"
                            >
                                <div
                                    className={cn(
                                        "relative z-10 flex size-24 items-center justify-center rounded-full border-2 bg-neutral-950",
                                        "border-highlight/30"
                                    )}
                                >
                                    <IconComponent
                                        weight="duotone"
                                        className="text-highlight size-10"
                                    />
                                    <span className="bg-highlight text-highlight-foreground absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full text-xs font-bold">
                                        {i + 1}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/70">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
