"use client";

import { CakeIcon } from "@phosphor-icons/react";
import { cn } from "@workspace/config";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { BIRTHDAY } from "./birthday-config";

const RING_GRADIENT =
    "conic-gradient(from 0deg, #fbbf24, #f472b6, #818cf8, #2dd4bf, #fbbf24)";

const FOUNDER_INITIALS = BIRTHDAY.founderFullName
    .split(" ")
    .map((word) => word[0])
    .join("");

export function BirthdayPortrait({ className }: { className?: string }) {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
        "loading"
    );
    const shouldReduceMotion = useReducedMotion();

    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), {
        stiffness: 150,
        damping: 18,
    });
    const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
        stiffness: 150,
        damping: 18,
    });

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (shouldReduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    };

    const resetPointer = () => {
        pointerX.set(0);
        pointerY.set(0);
    };

    return (
        <motion.div
            className={cn("relative", className)}
            style={{ rotateX, rotateY, transformPerspective: 700 }}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
        >
            <motion.div
                aria-hidden
                className="absolute -inset-2 rounded-full opacity-80 blur-md"
                style={{ background: RING_GRADIENT }}
                animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 9, ease: "linear", repeat: Infinity }}
            />
            <motion.div
                aria-hidden
                className="absolute -inset-1 rounded-full opacity-90"
                style={{ background: RING_GRADIENT }}
                animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 9, ease: "linear", repeat: Infinity }}
            />

            <div className="relative size-40 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 md:size-48">
                {status === "error" ? (
                    <div className="flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-indigo-500/70 via-violet-500/60 to-pink-500/70">
                        <CakeIcon
                            weight="fill"
                            className="size-8 text-white/90"
                        />
                        <span className="text-xl font-black tracking-wide text-white">
                            {FOUNDER_INITIALS}
                        </span>
                    </div>
                ) : (
                    <Image
                        src={BIRTHDAY.portraitUrl}
                        alt={BIRTHDAY.founderFullName}
                        fill
                        unoptimized
                        sizes="192px"
                        className={cn(
                            "object-cover transition-opacity duration-700",
                            status === "loaded" ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setStatus("loaded")}
                        onError={() => setStatus("error")}
                    />
                )}

                {status === "loading" && (
                    <div className="absolute inset-0 animate-pulse bg-white/10" />
                )}
            </div>
        </motion.div>
    );
}
