"use client";

import { useCourses } from "@/lib/rq";
import {
    cn,
    Course,
    FullCourseCategory,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export function CoursesPage() {
    const { useGet } = useCourses();
    const { data, isPending } = useGet({});

    const categories = useMemo(
        () => data?.categories ?? [],
        [data?.categories]
    );

    const allCourses = useMemo(
        () => categories.flatMap((c) => c.courses ?? []),
        [categories]
    );

    return (
        <section className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <BackgroundAura />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
                <CoursesHeader count={allCourses.length} />

                {isPending ? (
                    <CoursesSkeleton />
                ) : !allCourses.length ? (
                    <EmptyState />
                ) : (
                    <CategoryFilteredGrid categories={categories} />
                )}
            </div>
        </section>
    );
}

function BackgroundAura() {
    return (
        <>
            <div
                aria-hidden
                className="bg-highlight/15 pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="bg-highlight/10 pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_60%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.85)_100%)]"
            />
        </>
    );
}

function CoursesHeader({ count }: { count: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center"
        >
            <span
                className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1",
                    "text-xs font-semibold tracking-[0.25em] text-white/90 uppercase backdrop-blur-md"
                )}
            >
                <Icons.Sparkle
                    weight="fill"
                    className="text-highlight size-3"
                />
                {count > 0
                    ? `${count} course${count === 1 ? "" : "s"} available`
                    : "Curriculum"}
            </span>

            <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                Learn from <br />
                <span className="relative inline-block">
                    <span
                        aria-hidden
                        className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                    />
                    <span className="text-highlight">practitioners</span>
                </span>
            </h1>

            <p className="max-w-2xl text-base text-balance text-white/80 drop-shadow-md sm:text-lg">
                Structured, project-driven courses taught by mentors
                who&rsquo;ve shipped real work. Pick a track and start building.
            </p>
        </motion.div>
    );
}

function CategoryFilteredGrid({
    categories,
}: {
    categories: FullCourseCategory[];
}) {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
        null
    );

    const filtered = useMemo(() => {
        if (!activeCategoryId) return categories;
        return categories.filter((c) => c.id === activeCategoryId);
    }, [categories, activeCategoryId]);

    return (
        <div className="mt-14 space-y-16 sm:mt-16">
            <CategoryFilter
                categories={categories}
                activeId={activeCategoryId}
                onChange={setActiveCategoryId}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategoryId ?? "all"}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-16"
                >
                    {filtered.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function CategoryFilter({
    categories,
    activeId,
    onChange,
}: {
    categories: FullCourseCategory[];
    activeId: string | null;
    onChange: (id: string | null) => void;
}) {
    if (categories.length <= 1) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2"
        >
            <FilterChip
                isActive={activeId === null}
                onClick={() => onChange(null)}
            >
                All
            </FilterChip>
            {categories.map((c) => (
                <FilterChip
                    key={c.id}
                    isActive={activeId === c.id}
                    onClick={() => onChange(c.id)}
                >
                    {c.name}
                </FilterChip>
            ))}
        </motion.div>
    );
}

function FilterChip({
    isActive,
    onClick,
    children,
}: {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300",
                "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none",
                isActive
                    ? "bg-highlight text-highlight-foreground border-transparent shadow-lg shadow-black/40"
                    : "border-white/15 bg-white/5 text-white/80 backdrop-blur-md hover:border-white/30 hover:bg-white/10"
            )}
        >
            {children}
        </button>
    );
}

function CategorySection({ category }: { category: FullCourseCategory }) {
    const courses = category.courses ?? [];
    if (!courses.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
        >
            <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="bg-highlight inline-block size-2 rounded-full" />
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {category.name}
                    </h2>
                </div>
                <span className="text-xs tracking-[0.2em] text-white/50 uppercase">
                    {courses.length} course
                    {courses.length === 1 ? "" : "s"}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                ))}
            </div>
        </motion.div>
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
                delay: Math.min(index * 0.06, 0.3),
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

                <div className="relative -mt-12 space-y-3 p-5 sm:p-6">
                    <h3 className="text-xl leading-tight font-semibold text-white drop-shadow-md sm:text-2xl">
                        {course.title}
                    </h3>
                    <p className="line-clamp-3 text-sm text-white/70">
                        {course.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 text-sm font-semibold">
                        <span className="text-highlight transition-colors duration-300">
                            Explore course
                        </span>
                        <Icons.ArrowRight
                            weight="bold"
                            className="text-highlight size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                        />
                    </div>
                </div>

                <div
                    aria-hidden
                    className="bg-highlight/0 group-hover:bg-highlight/40 absolute inset-x-0 bottom-0 h-px transition-colors duration-500"
                />
            </Link>
        </motion.div>
    );
}

function CoursesSkeleton() {
    return (
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={`skeleton-${i}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
                >
                    <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.05]" />
                    <div className="space-y-3 p-5 sm:p-6">
                        <div className="h-5 w-3/4 animate-pulse rounded-md bg-white/10" />
                        <div className="h-3 w-full animate-pulse rounded-md bg-white/[0.06]" />
                        <div className="h-3 w-5/6 animate-pulse rounded-md bg-white/[0.06]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="mx-auto mt-20 flex max-w-xl flex-col items-center gap-5 text-center"
        >
            <div className="relative flex size-24 items-center justify-center">
                <div className="bg-highlight/20 absolute inset-0 rounded-full blur-2xl" />
                <div className="relative flex size-24 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
                    <Icons.Book
                        weight="duotone"
                        className="text-highlight size-10"
                    />
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Curriculum coming soon
            </h2>
            <p className="text-white/70">
                Our team is finishing up the first batch of courses. Check back
                shortly &mdash; or get notified when we go live.
            </p>

            <Link
                href="/booking"
                className={cn(
                    "group mt-3 inline-flex h-12 items-center gap-2 rounded-full px-7",
                    "bg-highlight text-highlight-foreground font-semibold",
                    "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40",
                    "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                )}
            >
                Talk to us
                <Icons.ArrowRight
                    weight="bold"
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
            </Link>
        </motion.div>
    );
}
