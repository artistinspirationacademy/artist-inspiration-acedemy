"use client";

import { SparkleIcon } from "@phosphor-icons/react";
import { cn } from "@workspace/config";
import { motion, useReducedMotion } from "motion/react";

const ORBS = [
    {
        className: "bg-indigo-500/25",
        size: 340,
        left: "6%",
        top: "10%",
        duration: 13,
    },
    {
        className: "bg-pink-500/20",
        size: 300,
        left: "70%",
        top: "6%",
        duration: 16,
    },
    {
        className: "bg-amber-400/15",
        size: 260,
        left: "14%",
        top: "60%",
        duration: 14,
    },
    {
        className: "bg-violet-500/20",
        size: 320,
        left: "66%",
        top: "56%",
        duration: 17,
    },
    {
        className: "bg-teal-400/15",
        size: 220,
        left: "40%",
        top: "28%",
        duration: 15,
    },
];

const SPARKLE_COLORS = [
    "text-amber-200/80",
    "text-pink-200/80",
    "text-white/70",
    "text-indigo-200/80",
];

const SPARKLES = Array.from({ length: 18 }, (_, index) => ({
    left: `${(index * 47 + 13) % 94}%`,
    top: `${(index * 29 + 7) % 88}%`,
    size: 8 + ((index * 5) % 10),
    delay: (index % 6) * 0.7,
    duration: 2.4 + (index % 4) * 0.6,
    color: SPARKLE_COLORS[index % SPARKLE_COLORS.length] ?? "text-white/70",
}));

const BALLOONS = [
    {
        left: "8%",
        delay: 0,
        duration: 26,
        drift: 26,
        gradient: "from-amber-300/60 to-amber-500/35",
    },
    {
        left: "26%",
        delay: 7,
        duration: 30,
        drift: -20,
        gradient: "from-pink-300/60 to-pink-500/35",
    },
    {
        left: "50%",
        delay: 3,
        duration: 28,
        drift: 22,
        gradient: "from-indigo-300/60 to-indigo-500/35",
    },
    {
        left: "72%",
        delay: 10,
        duration: 32,
        drift: -24,
        gradient: "from-teal-300/60 to-teal-500/35",
    },
    {
        left: "88%",
        delay: 5,
        duration: 27,
        drift: 18,
        gradient: "from-violet-300/60 to-violet-500/35",
    },
];

export function BirthdayParticles() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            {ORBS.map((orb, index) => (
                <motion.div
                    key={`orb-${index}`}
                    className={cn(
                        "absolute rounded-full blur-3xl",
                        orb.className
                    )}
                    style={{
                        width: orb.size,
                        height: orb.size,
                        left: orb.left,
                        top: orb.top,
                    }}
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : { y: [0, -28, 0], x: [0, 18, 0] }
                    }
                    transition={{
                        duration: orb.duration,
                        delay: index * 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {!shouldReduceMotion &&
                SPARKLES.map((sparkle, index) => (
                    <motion.span
                        key={`sparkle-${index}`}
                        className={cn("absolute", sparkle.color)}
                        style={{ left: sparkle.left, top: sparkle.top }}
                        animate={{
                            opacity: [0.05, 0.9, 0.05],
                            scale: [0.5, 1.05, 0.5],
                        }}
                        transition={{
                            duration: sparkle.duration,
                            delay: sparkle.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <SparkleIcon
                            weight="fill"
                            style={{
                                width: sparkle.size,
                                height: sparkle.size,
                            }}
                        />
                    </motion.span>
                ))}

            {!shouldReduceMotion &&
                BALLOONS.map((balloon, index) => (
                    <motion.div
                        key={`balloon-${index}`}
                        className="absolute top-full"
                        style={{ left: balloon.left }}
                        animate={{
                            y: ["0vh", "-135vh"],
                            x: [0, balloon.drift, -balloon.drift * 0.5, 0],
                            rotate: [-3, 3, -3],
                        }}
                        transition={{
                            y: {
                                duration: balloon.duration,
                                delay: balloon.delay,
                                repeat: Infinity,
                                ease: "linear",
                            },
                            x: {
                                duration: balloon.duration / 3,
                                delay: balloon.delay,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                            rotate: {
                                duration: 5,
                                delay: balloon.delay,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                    >
                        <div
                            className={cn(
                                "relative h-14 w-11 rounded-[50%_50%_50%_50%/45%_45%_55%_55%] bg-gradient-to-b",
                                balloon.gradient
                            )}
                        >
                            <div className="absolute top-2 left-2.5 h-4 w-2 -rotate-12 rounded-full bg-white/50 blur-[2px]" />
                        </div>
                        <div className="mx-auto h-16 w-px bg-white/20" />
                    </motion.div>
                ))}
        </div>
    );
}
