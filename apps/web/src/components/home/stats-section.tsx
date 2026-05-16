"use client";

import { cn, Icons } from "@workspace/config";
import { motion } from "motion/react";

interface Stat {
    label: string;
    value: string;
    icon: keyof typeof Icons;
}

const STATS: Stat[] = [
    { label: "Active students", value: "1,200+", icon: "Users" },
    { label: "Industry mentors", value: "30+", icon: "Sparkle" },
    { label: "Hours of content", value: "400+", icon: "Play" },
    { label: "Countries reached", value: "45+", icon: "MapPin" },
];

export function StatsSection() {
    return (
        <section className="bg-neutral-900 px-4 py-16 text-white sm:px-6 sm:py-20">
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4">
                {STATS.map((stat, i) => {
                    const IconComponent = Icons[stat.icon];
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: i * 0.08,
                            }}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm",
                                "sm:items-start sm:text-left"
                            )}
                        >
                            <IconComponent
                                weight="duotone"
                                className="text-highlight size-7"
                            />
                            <p className="text-3xl font-bold sm:text-4xl">
                                {stat.value}
                            </p>
                            <p className="text-xs tracking-[0.2em] text-white/60 uppercase">
                                {stat.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
