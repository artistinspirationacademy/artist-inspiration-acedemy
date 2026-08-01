"use client";

import { useTeacher } from "@/lib/rq";
import { cn, Icons } from "@workspace/config";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { TeacherProfile } from "./teacher-profile";

export function TeacherProfileFetch() {
    const router = useRouter();
    const { id } = useParams<{ id?: string }>();
    const teacherId = typeof id === "string" ? id : "";

    const { useGet } = useTeacher();
    const { data, isPending, isError } = useGet({ id: teacherId });

    useEffect(() => {
        if (!teacherId) router.replace("/teachers");
    }, [teacherId, router]);

    if (isPending) return <TeacherProfileSkeleton />;
    if (isError || !data || !data.isActive) return <NotFoundState />;

    return <TeacherProfile teacher={data} />;
}

function TeacherProfileSkeleton() {
    return (
        <div className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-24 sm:px-6 lg:px-8">
                <div className="h-7 w-40 animate-pulse rounded-full bg-white/[0.05]" />

                <div className="mt-10 grid gap-10 md:grid-cols-[6fr_5fr] md:items-center md:gap-14">
                    <div className="order-2 space-y-5 md:order-1">
                        <div className="flex gap-2">
                            <div className="h-6 w-24 animate-pulse rounded-full bg-white/[0.06]" />
                            <div className="h-6 w-20 animate-pulse rounded-full bg-white/[0.05]" />
                        </div>
                        <div className="h-12 w-3/4 animate-pulse rounded-md bg-white/10" />
                        <div className="h-4 w-1/2 animate-pulse rounded-md bg-white/[0.06]" />
                        <div className="h-12 w-44 animate-pulse rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="order-1 mx-auto aspect-[4/5] w-full max-w-md animate-pulse rounded-3xl bg-white/[0.05] md:order-2" />
                </div>

                <div className="mt-20 space-y-3">
                    <div className="h-5 w-32 animate-pulse rounded-md bg-white/10" />
                    <div className="h-3 w-full animate-pulse rounded-md bg-white/[0.05]" />
                    <div className="h-3 w-5/6 animate-pulse rounded-md bg-white/[0.05]" />
                </div>
            </div>
        </div>
    );
}

function NotFoundState() {
    return (
        <section className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5 px-4 pt-40 pb-24 text-center sm:px-6">
                <div className="relative flex size-24 items-center justify-center">
                    <div className="bg-highlight/15 absolute inset-0 rounded-full blur-2xl" />
                    <div className="relative flex size-24 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
                        <Icons.Users
                            weight="duotone"
                            className="text-highlight size-10"
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                    Mentor not found
                </h1>
                <p className="text-white/70">
                    The mentor you&rsquo;re looking for may have stepped away or
                    moved on.
                </p>

                <Link
                    href="/teachers"
                    className={cn(
                        "group mt-3 inline-flex h-12 items-center gap-2 rounded-full px-7",
                        "bg-highlight text-highlight-foreground font-semibold",
                        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40"
                    )}
                >
                    Browse all mentors
                    <Icons.ArrowRight
                        weight="bold"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                </Link>
            </div>
        </section>
    );
}
