"use client";

import {
    cn,
    Course,
    FullTeacher,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface TeacherProfileProps {
    teacher: FullTeacher;
}

export function TeacherProfile({ teacher }: TeacherProfileProps) {
    return (
        <article className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <BackgroundAura />

            <div className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-24 sm:px-6 sm:pt-28 lg:px-8">
                <BackLink />

                <Hero teacher={teacher} />

                {teacher.videoKey && (
                    <VideoSection videoKey={teacher.videoKey} />
                )}

                <AboutSection text={teacher.about} />

                {teacher.courses.length > 0 && (
                    <CoursesSection courses={teacher.courses} />
                )}

                <FooterCTA name={teacher.name} teacherId={teacher.id} />
            </div>
        </article>
    );
}

function BackgroundAura() {
    return (
        <>
            <div
                aria-hidden
                className="bg-highlight/20 pointer-events-none absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="bg-highlight/10 pointer-events-none absolute top-1/2 -left-32 h-96 w-96 rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_55%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4)_65%,rgba(0,0,0,0.85)_100%)]"
            />
        </>
    );
}

function BackLink() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Link
                href="/teachers"
                className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1",
                    "text-xs font-semibold tracking-[0.25em] text-white/90 uppercase backdrop-blur-md",
                    "transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                )}
            >
                <Icons.ArrowRight
                    weight="bold"
                    className="size-3 rotate-180"
                />
                Back to mentors
            </Link>
        </motion.div>
    );
}

function Hero({ teacher }: { teacher: FullTeacher }) {
    const imageUrl = generateUploadThingURL(teacher.imageKey);
    const courseNames = teacher.courses.map((c) => c.title);

    return (
        <section className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[6fr_5fr] md:items-center md:gap-14">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                className="order-2 flex flex-col gap-6 md:order-1"
            >
                {courseNames.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {courseNames.map((name) => (
                            <span
                                key={name}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
                                    "border-highlight/40 bg-highlight/10 text-highlight text-[10px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md"
                                )}
                            >
                                <Icons.Sparkle
                                    weight="fill"
                                    className="size-2.5"
                                />
                                {name}
                            </span>
                        ))}
                    </div>
                )}

                <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-5xl md:text-6xl">
                    {teacher.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                    <RatingStars value={teacher.rating} />
                    <span className="h-4 w-px bg-white/20" />
                    <ExperienceBadge value={teacher.experience} />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                        href={`/booking?teacher=${teacher.id}`}
                        className={cn(
                            "group inline-flex h-12 items-center gap-2 rounded-full px-6",
                            "bg-highlight text-highlight-foreground font-semibold",
                            "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40",
                            "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                        )}
                    >
                        Book a session
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>

                    {teacher.videoKey && (
                        <a
                            href="#intro-video"
                            className={cn(
                                "group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6",
                                "text-sm font-semibold text-white/90 backdrop-blur-md",
                                "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
                            )}
                        >
                            <Icons.Play
                                weight="fill"
                                className="text-highlight size-4"
                            />
                            Watch intro
                        </a>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="order-1 md:order-2"
            >
                <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-white/10">
                    <Image
                        src={imageUrl}
                        alt={teacher.name}
                        fill
                        priority
                        sizes="(min-width: 768px) 40vw, 90vw"
                        className="animate-hero-kenburns size-full object-cover"
                        unoptimized
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    <div
                        aria-hidden
                        className="bg-highlight/30 pointer-events-none absolute -top-12 -right-12 size-48 rounded-full blur-3xl"
                    />
                </div>
            </motion.div>
        </section>
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

function VideoSection({ videoKey }: { videoKey: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const url = generateUploadThingURL(videoKey);

    return (
        <motion.section
            id="intro-video"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-20 scroll-mt-24 sm:mt-24"
        >
            <SectionHeader label="Intro" title="Hear it from them" />

            <div
                className={cn(
                    "group relative mt-8 overflow-hidden rounded-3xl border border-white/10",
                    "bg-black shadow-2xl shadow-black/60"
                )}
            >
                <div
                    aria-hidden
                    className="bg-highlight/20 pointer-events-none absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
                />

                <video
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="relative z-10 aspect-video w-full bg-black object-contain"
                />

                <div
                    aria-hidden
                    className={cn(
                        "pointer-events-none absolute inset-0 z-20 transition-opacity duration-500",
                        isPlaying ? "opacity-0" : "opacity-100"
                    )}
                />
            </div>
        </motion.section>
    );
}

function AboutSection({ text }: { text: string }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-20 sm:mt-24"
        >
            <SectionHeader label="About" title="The story" />

            <div className="mt-8 border-l-2 border-white/15 pl-5 sm:pl-6">
                <p className="text-base leading-relaxed whitespace-pre-line text-white/85 sm:text-lg">
                    {text}
                </p>
            </div>
        </motion.section>
    );
}

function CoursesSection({ courses }: { courses: Course[] }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-20 sm:mt-24"
        >
            <SectionHeader
                label={`${courses.length} course${courses.length === 1 ? "" : "s"}`}
                title="What they teach"
            />

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                ))}
            </div>
        </motion.section>
    );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
    const url = generateUploadThingURL(course.cardImageKey);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.55,
                ease: "easeOut",
                delay: Math.min(index * 0.06, 0.25),
            }}
        >
            <Link
                href={`/courses/${course.id}`}
                className={cn(
                    "group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md",
                    "transition-all duration-500 ease-out hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]",
                    "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                )}
            >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                        src={url}
                        alt={course.title}
                        fill
                        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
                </div>

                <div className="relative -mt-10 space-y-2 p-5">
                    <h3 className="text-lg leading-tight font-semibold text-white drop-shadow-md sm:text-xl">
                        {course.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-white/70">
                        {course.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 text-sm font-semibold">
                        <span className="text-highlight">Explore</span>
                        <Icons.ArrowRight
                            weight="bold"
                            className="text-highlight size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                        />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function FooterCTA({
    name,
    teacherId,
}: {
    name: string;
    teacherId: string;
}) {
    const firstName = name.split(/\s+/)[0] ?? name;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "relative mt-24 overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12",
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
                        Learn directly from {firstName}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 sm:text-base">
                        Book a discovery call and we&rsquo;ll walk you through
                        cohort dates and how mentoring works.
                    </p>
                </div>

                <Link
                    href={`/booking?teacher=${teacherId}`}
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

function SectionHeader({
    label,
    title,
}: {
    label: string;
    title: string;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-center gap-3">
                <span className="bg-highlight inline-block size-2 rounded-full" />
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {title}
                </h2>
            </div>
            <span className="text-xs tracking-[0.2em] text-white/50 uppercase">
                {label}
            </span>
        </div>
    );
}
