"use client";

import { useTeachers } from "@/lib/rq";
import { cn, FullTeacher, Icons } from "@workspace/config";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TeacherCard } from "./teacher-card";

export function TeachersPage() {
    const { useGet } = useTeachers();
    const { data, isPending } = useGet();

    const teachers = useMemo(() => data ?? [], [data]);

    return (
        <section className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <BackgroundAura />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
                <TeachersHeader count={teachers.length} />

                {isPending ? (
                    <TeachersSkeleton />
                ) : !teachers.length ? (
                    <EmptyState />
                ) : (
                    <CourseFilteredGrid teachers={teachers} />
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

function TeachersHeader({ count }: { count: number }) {
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
                    ? `${count} mentor${count === 1 ? "" : "s"}`
                    : "Mentors"}
            </span>

            <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                Meet your <br />
                <span className="relative inline-block">
                    <span
                        aria-hidden
                        className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                    />
                    <span className="text-highlight">mentors</span>
                </span>
            </h1>

            <p className="max-w-2xl text-base text-balance text-white/80 drop-shadow-md sm:text-lg">
                Working practitioners guiding every cohort. Each mentor brings
                years of hands-on craft and a track record of shipped work.
            </p>
        </motion.div>
    );
}

function CourseFilteredGrid({ teachers }: { teachers: FullTeacher[] }) {
    const courses = useMemo(() => {
        const seen = new Map<string, { id: string; title: string }>();
        for (const t of teachers) {
            for (const c of t.courses ?? []) {
                if (!seen.has(c.id))
                    seen.set(c.id, { id: c.id, title: c.title });
            }
        }
        return Array.from(seen.values()).sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }, [teachers]);

    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!activeCourseId) return teachers;
        return teachers.filter((t) =>
            (t.courses ?? []).some((c) => c.id === activeCourseId)
        );
    }, [teachers, activeCourseId]);

    return (
        <div className="mt-14 space-y-10 sm:mt-16">
            <CourseFilter
                courses={courses}
                activeId={activeCourseId}
                onChange={setActiveCourseId}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCourseId ?? "all"}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {filtered.map((teacher, index) => (
                        <TeacherCard
                            key={teacher.id}
                            teacher={teacher}
                            courseNames={(teacher.courses ?? []).map(
                                (c) => c.title
                            )}
                            index={index}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function CourseFilter({
    courses,
    activeId,
    onChange,
}: {
    courses: { id: string; title: string }[];
    activeId: string | null;
    onChange: (id: string | null) => void;
}) {
    if (courses.length <= 1) return null;

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
            {courses.map((c) => (
                <FilterChip
                    key={c.id}
                    isActive={activeId === c.id}
                    onClick={() => onChange(c.id)}
                >
                    {c.title}
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

function TeachersSkeleton() {
    return (
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={`skeleton-${i}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
                >
                    <div className="aspect-[4/5] w-full animate-pulse bg-white/[0.05]" />
                    <div className="space-y-3 p-5">
                        <div className="h-4 w-3/4 animate-pulse rounded-md bg-white/10" />
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
                    <Icons.Users
                        weight="duotone"
                        className="text-highlight size-10"
                    />
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Mentors joining soon
            </h2>
            <p className="text-white/70">
                We&rsquo;re finalising our roster of practitioners. Drop us a
                line and we&rsquo;ll introduce you the moment they&rsquo;re
                announced.
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
