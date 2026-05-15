"use client";

import {
    cn,
    generateUploadThingURL,
    Icons,
    Teacher,
} from "@workspace/config";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

interface TeacherCardProps {
    teacher: Teacher;
    courseNames?: string[];
    index?: number;
}

export function TeacherCard({
    teacher,
    courseNames,
    index = 0,
}: TeacherCardProps) {
    const url = generateUploadThingURL(teacher.imageKey);
    const primary = courseNames?.[0];
    const extraCount = (courseNames?.length ?? 0) - 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.55,
                ease: "easeOut",
                delay: Math.min(index * 0.06, 0.3),
            }}
        >
            <Link
                href={`/teachers/${teacher.id}`}
                className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left backdrop-blur-md",
                    "transition-all duration-500 ease-out hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]",
                    "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                )}
            >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                        src={url}
                        alt={teacher.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                    {primary && (
                        <div className="absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1">
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1.5 truncate rounded-full border px-2.5 py-1",
                                    "border-highlight/40 bg-highlight/15 text-highlight text-[10px] font-semibold tracking-[0.18em] uppercase backdrop-blur-md"
                                )}
                            >
                                <Icons.Sparkle
                                    weight="fill"
                                    className="size-2.5"
                                />
                                <span className="truncate">{primary}</span>
                            </span>
                            {extraCount > 0 && (
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full border px-2 py-1",
                                        "border-white/20 bg-black/40 text-[10px] font-semibold tracking-[0.18em] text-white/90 uppercase backdrop-blur-md"
                                    )}
                                >
                                    +{extraCount}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <h3 className="text-lg leading-tight font-semibold text-white drop-shadow-md sm:text-xl">
                            {teacher.name}
                        </h3>
                        <RatingStars value={teacher.rating} />
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-white/75">
                        {teacher.about}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-xs">
                        <span className="text-white/50">Experience</span>
                        <span className="text-highlight font-semibold tabular-nums">
                            {formatYears(teacher.experience)}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function RatingStars({ value }: { value: number }) {
    const clamped = Math.max(0, Math.min(5, value));

    return (
        <div className="mt-1.5 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => {
                const starIndex = i + 1;
                const isFull = clamped >= starIndex;
                const isHalf = !isFull && clamped >= starIndex - 0.5;

                return (
                    <div key={starIndex} className="relative size-3.5">
                        <Icons.Star
                            weight={isFull ? "fill" : "regular"}
                            className={cn(
                                "size-3.5",
                                isFull ? "text-amber-400" : "text-white/30"
                            )}
                        />
                        {isHalf && (
                            <Icons.StarHalf
                                weight="fill"
                                className="absolute inset-0 size-3.5 text-amber-400"
                            />
                        )}
                    </div>
                );
            })}
            <span className="ml-1 text-xs font-medium text-white/80 tabular-nums">
                {clamped.toFixed(1)}
            </span>
        </div>
    );
}

function formatYears(value: number): string {
    if (value <= 0) return "—";
    const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    return `${rounded} ${value === 1 ? "year" : "years"}`;
}
