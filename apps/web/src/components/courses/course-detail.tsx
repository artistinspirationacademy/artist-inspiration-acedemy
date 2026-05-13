"use client";

import {
    cn,
    CourseDetails,
    FullCourse,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

interface CourseDetailProps {
    course: FullCourse;
}

export function CourseDetail({ course }: CourseDetailProps) {
    const coverUrl = generateUploadThingURL(course.coverImageKey);
    const details = (course.details ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);

    return (
        <article className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <CourseHero course={course} coverUrl={coverUrl} />

            <div className="relative z-10 mx-auto max-w-4xl px-4 pt-4 pb-24 sm:px-6 lg:px-8">
                <CourseIntro course={course} />

                {details.length > 0 && (
                    <div className="mt-16 space-y-12">
                        {details.map((detail, index) => (
                            <DetailRenderer
                                key={detail.id}
                                detail={detail}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                <CourseFooterCTA />
            </div>
        </article>
    );
}

function CourseHero({
    course,
    coverUrl,
}: {
    course: FullCourse;
    coverUrl: string;
}) {
    return (
        <section className="relative h-[75svh] min-h-[520px] w-full overflow-hidden">
            <div className="absolute inset-0">
                <Image
                    src={coverUrl}
                    alt={course.title}
                    fill
                    priority
                    sizes="100vw"
                    className="animate-hero-kenburns size-full object-cover"
                    unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.6)_60%,rgba(0,0,0,0.92)_100%)]" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-neutral-950" />
            </div>

            <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex max-w-3xl flex-col gap-5"
                >
                    <Link
                        href="/courses"
                        className={cn(
                            "inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1",
                            "text-xs font-semibold tracking-[0.25em] text-white/90 uppercase backdrop-blur-md",
                            "transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                        )}
                    >
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-3 rotate-180"
                        />
                        Back to courses
                    </Link>

                    <span
                        className={cn(
                            "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1",
                            "text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-md",
                            "border-highlight/40 bg-highlight/10 text-highlight"
                        )}
                    >
                        <Icons.Sparkle weight="fill" className="size-3" />
                        {course.category.name}
                    </span>

                    <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                        {course.title}
                    </h1>
                </motion.div>
            </div>
        </section>
    );
}

function CourseIntro({ course }: { course: FullCourse }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="mt-12 border-l-2 border-white/15 pl-5 sm:pl-6"
        >
            <p className="text-lg leading-relaxed text-white/85 sm:text-xl">
                {course.description}
            </p>
        </motion.div>
    );
}

function CourseFooterCTA() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "relative mt-20 overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12",
                "bg-linear-to-br from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-md"
            )}
        >
            <div
                aria-hidden
                className="bg-highlight/15 absolute -top-32 -right-20 size-72 rounded-full blur-3xl"
            />

            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-md">
                    <h3 className="text-2xl font-bold text-white sm:text-3xl">
                        Ready to enroll?
                    </h3>
                    <p className="mt-2 text-sm text-white/70 sm:text-base">
                        Book a discovery call and we&rsquo;ll walk you through
                        the cohort schedule, mentors, and outcomes.
                    </p>
                </div>

                <Link
                    href="/booking"
                    className={cn(
                        "group inline-flex h-12 items-center gap-2 rounded-full px-7",
                        "bg-highlight text-highlight-foreground font-semibold whitespace-nowrap",
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
            </div>
        </motion.div>
    );
}

function DetailRenderer({
    detail,
    index,
}: {
    detail: CourseDetails;
    index: number;
}) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: Math.min(index * 0.05, 0.2),
            }}
            className="space-y-5"
        >
            <header className="flex items-baseline gap-3">
                <span className="bg-highlight inline-block size-2 rounded-full" />
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {detail.title}
                </h2>
            </header>

            <div className="pl-5">
                <DetailBody detail={detail} />
            </div>
        </motion.section>
    );
}

function DetailBody({ detail }: { detail: CourseDetails }) {
    if (detail.type === "text") {
        return (
            <p className="leading-relaxed whitespace-pre-line text-white/80">
                {detail.content}
            </p>
        );
    }

    if (detail.type === "image") {
        const url = generateUploadThingURL(detail.content);
        return (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
                <Image
                    src={url}
                    alt={detail.title}
                    fill
                    sizes="(min-width: 768px) 56rem, 100vw"
                    className="size-full object-cover"
                    unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
            </div>
        );
    }

    if (detail.type === "accordion") {
        return (
            <div className="space-y-2">
                {detail.content.map((item, i) => (
                    <AccordionRow
                        key={`${detail.id}-${i}`}
                        keyLabel={item.key}
                        value={item.value}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {detail.content.map((item, i) => (
                <div
                    key={`${detail.id}-${i}`}
                    className={cn(
                        "rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md",
                        "transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]"
                    )}
                >
                    <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                        {item.key}
                    </p>
                    <p className="mt-1.5 text-base text-white/90">
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

function AccordionRow({
    keyLabel,
    value,
}: {
    keyLabel: string;
    value: string;
}) {
    return (
        <details
            className={cn(
                "group rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md",
                "transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06]",
                "open:border-white/25 open:bg-white/[0.07]"
            )}
        >
            <summary
                className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 px-5 py-4 list-none",
                    "text-base font-medium text-white",
                    "[&::-webkit-details-marker]:hidden"
                )}
            >
                {keyLabel}
                <Icons.ArrowRight
                    weight="bold"
                    className="text-highlight size-4 shrink-0 transition-transform duration-300 group-open:rotate-90"
                />
            </summary>
            <div className="px-5 pb-4 text-sm leading-relaxed whitespace-pre-line text-white/75">
                {value}
            </div>
        </details>
    );
}
