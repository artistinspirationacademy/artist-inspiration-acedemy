"use client";

import { useCourse, useTeachers } from "@/lib/rq";
import { cn, Icons, Teacher } from "@workspace/config";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CourseDetail } from "./course-detail";

export function CourseDetailFetch() {
    const router = useRouter();
    const { id } = useParams<{ id?: string }>();
    const courseId = typeof id === "string" ? id : "";

    const { useGet: useCourseGet } = useCourse();
    const { data: course, isPending: isCoursePending, isError } = useCourseGet({
        id: courseId,
    });

    const { useGet: useTeachersGet } = useTeachers();
    const { data: teachers = [] } = useTeachersGet<Teacher[]>({
        courseId: courseId || undefined,
        enabled: !!courseId,
    });

    useEffect(() => {
        if (!courseId) router.replace("/courses");
    }, [courseId, router]);

    if (isCoursePending) return <CourseDetailSkeleton />;

    if (isError || !course || !course.isActive) return <NotFoundState />;

    return <CourseDetail course={course} teachers={teachers} />;
}

function CourseDetailSkeleton() {
    return (
        <div className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <div className="h-[75svh] min-h-[520px] w-full animate-pulse bg-white/[0.04]" />

            <div className="mx-auto max-w-4xl space-y-8 px-4 pt-12 pb-24 sm:px-6 lg:px-8">
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-white/10" />
                <div className="h-5 w-2/3 animate-pulse rounded-md bg-white/[0.06]" />
                <div className="space-y-3 pt-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-3 w-full animate-pulse rounded-md bg-white/[0.05]"
                        />
                    ))}
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
                        <Icons.Book
                            weight="duotone"
                            className="text-highlight size-10"
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                    Course not found
                </h1>
                <p className="text-white/70">
                    The course you&rsquo;re looking for may have been moved or
                    is no longer available.
                </p>

                <a
                    href="/courses"
                    className={cn(
                        "group mt-3 inline-flex h-12 items-center gap-2 rounded-full px-7",
                        "bg-highlight text-highlight-foreground font-semibold",
                        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40"
                    )}
                >
                    Browse all courses
                    <Icons.ArrowRight
                        weight="bold"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                </a>
            </div>
        </section>
    );
}
