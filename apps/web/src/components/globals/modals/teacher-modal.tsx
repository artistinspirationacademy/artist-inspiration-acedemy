"use client";

import { Dialog, DialogPortal } from "@/components/ui/dialog";
import {
    cn,
    generateUploadThingURL,
    Icons,
    Teacher,
} from "@workspace/config";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";

interface TeacherModalProps {
    teacher: Teacher | null;
    courseNames?: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TeacherModal({
    teacher,
    courseNames,
    open,
    onOpenChange,
}: TeacherModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && teacher && (
                    <DialogPortal forceMount>
                        <DialogPrimitive.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.25,
                                    ease: "easeOut",
                                }}
                                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                            />
                        </DialogPrimitive.Overlay>

                        <DialogPrimitive.Content
                            asChild
                            onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className={cn(
                                    "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                                    "w-[calc(100vw-2rem)] max-w-5xl outline-none",
                                    "max-h-[calc(100vh-2rem)] overflow-hidden",
                                    "rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl shadow-black/60"
                                )}
                            >
                                <TeacherModalContent
                                    teacher={teacher}
                                    courseNames={courseNames}
                                />
                            </motion.div>
                        </DialogPrimitive.Content>
                    </DialogPortal>
                )}
            </AnimatePresence>
        </Dialog>
    );
}

function TeacherModalContent({
    teacher,
    courseNames,
}: {
    teacher: Teacher;
    courseNames?: string[];
}) {
    const imageUrl = generateUploadThingURL(teacher.imageKey);

    return (
        <div className="relative grid max-h-[calc(100vh-2rem)] grid-cols-1 overflow-y-auto md:grid-cols-[5fr_6fr] md:overflow-hidden">
            <div
                aria-hidden
                className="bg-highlight/15 pointer-events-none absolute -top-32 right-0 size-72 rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="bg-highlight/10 pointer-events-none absolute -bottom-24 -left-10 size-64 rounded-full blur-3xl"
            />

            <DialogPrimitive.Close
                className={cn(
                    "absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full",
                    "border border-white/15 bg-black/40 text-white/80 backdrop-blur-md",
                    "transition-all duration-200 hover:border-white/30 hover:bg-black/60 hover:text-white",
                    "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                )}
                aria-label="Close"
            >
                <Icons.Close weight="bold" className="size-4" />
            </DialogPrimitive.Close>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="relative h-[40svh] w-full min-h-[280px] md:h-full md:min-h-[460px]"
            >
                <Image
                    src={imageUrl}
                    alt={teacher.name}
                    fill
                    priority
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="size-full object-cover"
                    unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent md:bg-linear-to-r md:from-transparent md:via-transparent md:to-neutral-950/80" />

                {courseNames && courseNames.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="absolute top-4 left-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-1.5"
                    >
                        {courseNames.map((name) => (
                            <span
                                key={name}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
                                    "border-highlight/40 bg-highlight/15 text-highlight",
                                    "text-[10px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md"
                                )}
                            >
                                <Icons.Sparkle
                                    weight="fill"
                                    className="size-2.5"
                                />
                                {name}
                            </span>
                        ))}
                    </motion.div>
                )}
            </motion.div>

            <div className="relative flex flex-col gap-6 overflow-y-auto p-6 sm:p-8 md:max-h-[calc(100vh-2rem)] md:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="space-y-3"
                >
                    <DialogPrimitive.Title asChild>
                        <h2 className="text-3xl leading-tight font-bold text-white sm:text-4xl">
                            {teacher.name}
                        </h2>
                    </DialogPrimitive.Title>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <RatingStars value={teacher.rating} />
                        <span className="h-4 w-px bg-white/20" />
                        <ExperienceBadge value={teacher.experience} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="relative space-y-3"
                >
                    <span className="text-xs tracking-[0.22em] text-white/50 uppercase">
                        About
                    </span>
                    <DialogPrimitive.Description asChild>
                        <p className="leading-relaxed whitespace-pre-line text-white/85">
                            {teacher.about}
                        </p>
                    </DialogPrimitive.Description>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                    className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-sm text-white/65">
                        Want to learn directly from {firstName(teacher.name)}?
                    </p>
                    <Link
                        href="/booking"
                        className={cn(
                            "group inline-flex h-11 items-center justify-center gap-2 rounded-full px-5",
                            "bg-highlight text-highlight-foreground text-sm font-semibold whitespace-nowrap",
                            "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40",
                            "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                        )}
                    >
                        Book a call
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

function RatingStars({ value }: { value: number }) {
    const clamped = Math.max(0, Math.min(5, value));

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => {
                const starIndex = i + 1;
                const isFull = clamped >= starIndex;
                const isHalf = !isFull && clamped >= starIndex - 0.5;

                return (
                    <div key={starIndex} className="relative size-4">
                        <Icons.Star
                            weight={isFull ? "fill" : "regular"}
                            className={cn(
                                "size-4",
                                isFull ? "text-amber-400" : "text-white/25"
                            )}
                        />
                        {isHalf && (
                            <Icons.StarHalf
                                weight="fill"
                                className="absolute inset-0 size-4 text-amber-400"
                            />
                        )}
                    </div>
                );
            })}
            <span className="ml-1.5 text-sm font-semibold text-white/90 tabular-nums">
                {clamped.toFixed(1)}
            </span>
        </div>
    );
}

function ExperienceBadge({ value }: { value: number }) {
    if (value <= 0) return null;
    const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    return (
        <span className="text-sm text-white/80">
            <span className="text-highlight font-semibold tabular-nums">
                {rounded}
            </span>
            <span className="ml-1 text-white/60">
                {value === 1 ? "year" : "years"} of experience
            </span>
        </span>
    );
}

function firstName(name: string): string {
    return name.split(/\s+/)[0] ?? name;
}
