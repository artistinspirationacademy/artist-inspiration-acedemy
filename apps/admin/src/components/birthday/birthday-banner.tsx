"use client";

import { useBirthdayWindow } from "@/hooks/use-birthday-window";
import { CakeIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BIRTHDAY, toOrdinal } from "./birthday-config";

const BirthdayExperience = dynamic(
    () =>
        import("./birthday-experience").then(
            (module) => module.BirthdayExperience
        ),
    { ssr: false }
);

export function BirthdayBanner() {
    const { isActive, age } = useBirthdayWindow(BIRTHDAY);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isExperienceOpen, setIsExperienceOpen] = useState(false);

    // Warm the lazy celebration chunk, but only while the birthday window
    // is active — outside of it nothing celebration-related is loaded.
    useEffect(() => {
        if (isActive) void import("./birthday-experience");
    }, [isActive]);

    const title = age
        ? `Happy ${toOrdinal(age)} Birthday, ${BIRTHDAY.founderFirstName}!`
        : `Happy Birthday, ${BIRTHDAY.founderFirstName}!`;

    return (
        <>
            <AnimatePresence>
                {isActive && !isDismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: -14, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -14, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-1">
                            <div className="relative overflow-hidden rounded-xl border border-pink-500/25 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-indigo-500/10 dark:border-pink-400/20">
                                <motion.div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    animate={{ x: ["-150%", "450%"] }}
                                    transition={{
                                        duration: 5,
                                        ease: "linear",
                                        repeat: Infinity,
                                        repeatDelay: 2.5,
                                    }}
                                />

                                <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-500 text-white shadow-lg">
                                            <CakeIcon
                                                weight="fill"
                                                className="size-5"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">
                                                {title} 🎉
                                            </p>
                                            <p className="text-muted-foreground text-xs sm:text-sm">
                                                Thank you for building Artist
                                                Inspiration Academy and
                                                inspiring every artist here.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                                        <motion.button
                                            type="button"
                                            onClick={() =>
                                                setIsExperienceOpen(true)
                                            }
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md sm:text-sm"
                                        >
                                            <SparkleIcon
                                                weight="fill"
                                                className="size-4"
                                            />
                                            Unwrap your surprise
                                        </motion.button>

                                        <button
                                            type="button"
                                            onClick={() => setIsDismissed(true)}
                                            aria-label="Dismiss birthday banner"
                                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-2 transition-colors"
                                        >
                                            <XIcon className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isActive && isExperienceOpen && (
                    <BirthdayExperience
                        age={age}
                        onClose={() => setIsExperienceOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
