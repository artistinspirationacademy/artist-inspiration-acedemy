"use client";

import { ConfettiIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import { motion, type Variants } from "motion/react";
import { useEffect, useRef } from "react";
import {
    BirthdayConfetti,
    type BirthdayConfettiHandle,
} from "./birthday-confetti";
import { BIRTHDAY, toOrdinal } from "./birthday-config";
import { BirthdayParticles } from "./birthday-particles";
import { BirthdayPortrait } from "./birthday-portrait";

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.14, delayChildren: 0.25 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

interface BirthdayExperienceProps {
    age: number | null;
    onClose: () => void;
}

export function BirthdayExperience({ age, onClose }: BirthdayExperienceProps) {
    const confettiRef = useRef<BirthdayConfettiHandle>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        confettiRef.current?.burst(event.clientX, event.clientY);
    };

    const title = age
        ? `Happy ${toOrdinal(age)} Birthday, ${BIRTHDAY.founderFirstName}!`
        : `Happy Birthday, ${BIRTHDAY.founderFirstName}!`;

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Happy birthday, ${BIRTHDAY.founderFullName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onPointerDown={handlePointerDown}
            className="fixed inset-0 z-100 overflow-y-auto bg-[#0c0a1d]"
        >
            <div aria-hidden className="pointer-events-none fixed inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.28),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.18),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(45,212,191,0.12),transparent_60%)]" />
            </div>

            <BirthdayParticles />
            <BirthdayConfetti ref={confettiRef} className="fixed z-20" />

            <motion.button
                type="button"
                onClick={onClose}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label="Close celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="fixed top-4 right-4 z-40 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
            >
                <XIcon className="size-5" />
            </motion.button>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-7 px-6 py-20 text-center"
            >
                <motion.p
                    variants={itemVariants}
                    className="flex items-center gap-3 text-xs font-semibold tracking-[0.35em] text-white/50 uppercase"
                >
                    <SparkleIcon weight="fill" className="size-3.5" />
                    August 9 · A little surprise from DRVGO
                    <SparkleIcon weight="fill" className="size-3.5" />
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center"
                >
                    <BirthdayPortrait />
                    <p className="mt-5 text-sm font-semibold text-white/80">
                        {BIRTHDAY.founderFullName}
                    </p>
                    <p className="mt-1 text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">
                        Founder · Artist Inspiration Academy
                    </p>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="bg-gradient-to-r from-amber-200 via-pink-300 to-indigo-300 bg-clip-text text-4xl font-black tracking-tight text-balance text-transparent sm:text-5xl md:text-6xl"
                >
                    {title}
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="max-w-xl text-base leading-relaxed text-pretty text-white/75 md:text-lg"
                >
                    It&apos;s been quite a journey—from our school days, making
                    music together, and somehow keeping a YouTube channel alive
                    for six months, to seeing you build Artist Inspiration
                    Academy into what it is today. I&apos;m genuinely proud of
                    everything you&apos;ve achieved. Happy Birthday, brother! ❤️
                </motion.p>

                <motion.div variants={itemVariants} className="space-y-1">
                    <p className="text-sm font-semibold text-white/85">
                        Keep creating, keep inspiring, and never stop dreaming.
                        🎉
                    </p>
                    <p className="text-sm text-white/50 italic">— DRVGO ❤️</p>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center gap-3"
                >
                    <motion.button
                        type="button"
                        onClick={() => confettiRef.current?.volley()}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(236,72,153,0.35)]"
                    >
                        <ConfettiIcon weight="fill" className="size-4.5" />
                        Celebrate Again
                    </motion.button>

                    <motion.button
                        type="button"
                        onClick={onClose}
                        onPointerDown={(event) => event.stopPropagation()}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 backdrop-blur-sm transition-colors hover:bg-white/10"
                    >
                        Back to AIA
                    </motion.button>
                </motion.div>

                <motion.p
                    variants={itemVariants}
                    className="text-xs text-white/40"
                >
                    psst… click anywhere for more confetti ✨
                </motion.p>
            </motion.div>
        </motion.div>
    );
}
