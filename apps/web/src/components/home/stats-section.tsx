"use client";

import { cn, Configuration, Icons } from "@workspace/config";
import { motion } from "motion/react";

interface StatsSectionProps {
    configuration: Configuration | null;
}

const STAT_DEFS: {
    label: string;
    icon: keyof typeof Icons;
    suffix?: string;
    pick: (c: Configuration) => number;
}[] = [
    {
        label: "Active learners",
        icon: "Users",
        suffix: "+",
        pick: (c) => c.learnerCount,
    },
    {
        label: "Industry mentors",
        icon: "Sparkle",
        suffix: "+",
        pick: (c) => c.teacherCount,
    },
    {
        label: "Hours of content",
        icon: "Play",
        suffix: "+",
        pick: (c) => c.contentHoursCount,
    },
    {
        label: "Countries reached",
        icon: "MapPin",
        suffix: "+",
        pick: (c) => c.countryCount,
    },
];

function formatCount(value: number) {
    if (value >= 1000) {
        const rounded = Math.round((value / 1000) * 10) / 10;
        return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)}k`;
    }
    return value.toLocaleString();
}

export function StatsSection({ configuration }: StatsSectionProps) {
    if (!configuration) return null;

    const stats = STAT_DEFS.map((def) => ({
        ...def,
        value: def.pick(configuration),
    })).filter((s) => s.value > 0);

    if (stats.length === 0) return null;

    return (
        <section className="bg-neutral-900 px-4 py-16 text-white sm:px-6 sm:py-20">
            <div
                className={cn(
                    "mx-auto grid w-full max-w-6xl gap-6",
                    stats.length === 1 && "grid-cols-1",
                    stats.length === 2 && "grid-cols-2",
                    stats.length === 3 && "grid-cols-2 lg:grid-cols-3",
                    stats.length >= 4 && "grid-cols-2 lg:grid-cols-4"
                )}
            >
                {stats.map((stat, i) => {
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
                                {formatCount(stat.value)}
                                {stat.suffix}
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
