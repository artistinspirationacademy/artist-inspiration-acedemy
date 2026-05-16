"use client";

import {
    cn,
    FullTestimonial,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import { SectionHeader } from "./features-section";

interface TestimonialsSectionProps {
    testimonials: FullTestimonial[];
    isLoading?: boolean;
}

export function TestimonialsSection({
    testimonials,
    isLoading,
}: TestimonialsSectionProps) {
    const { rowA, rowB } = useMemo(() => {
        if (testimonials.length <= 4) {
            return { rowA: testimonials, rowB: [] as FullTestimonial[] };
        }
        const half = Math.ceil(testimonials.length / 2);
        return {
            rowA: testimonials.slice(0, half),
            rowB: testimonials.slice(half),
        };
    }, [testimonials]);

    if (!isLoading && testimonials.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-neutral-950 px-4 py-20 sm:px-6 sm:py-28">
            <div className="bg-highlight/10 pointer-events-none absolute top-1/2 left-1/2 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12">
                <SectionHeader
                    eyebrow="From our students"
                    title="Real stories. Real progress."
                    description="Voices of the artists who've trusted us with their craft."
                />
            </div>

            {isLoading ? (
                <div className="relative mx-auto mt-12 flex w-full max-w-7xl gap-5 px-4 sm:px-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-52 w-[340px] shrink-0 animate-pulse rounded-2xl bg-white/5"
                        />
                    ))}
                </div>
            ) : (
                <div className="relative mt-14 flex flex-col gap-6">
                    <MarqueeRow items={rowA} direction="left" duration={48} />
                    {rowB.length > 0 && (
                        <MarqueeRow
                            items={rowB}
                            direction="right"
                            duration={56}
                        />
                    )}
                </div>
            )}
        </section>
    );
}

function MarqueeRow({
    items,
    direction,
    duration,
}: {
    items: FullTestimonial[];
    direction: "left" | "right";
    duration: number;
}) {
    const [isPaused, setIsPaused] = useState(false);
    const loop = useMemo(() => [...items, ...items], [items]);
    const style: CSSProperties = {
        ["--marquee-duration" as string]: `${duration}s`,
    };

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden",
                "[mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className={cn(
                    "flex w-max gap-5 px-2",
                    direction === "left"
                        ? "animate-marquee-left"
                        : "animate-marquee-right",
                    isPaused && "marquee-paused"
                )}
                style={style}
            >
                {loop.map((t, i) => (
                    <TestimonialCard
                        key={`${t.id}-${i}`}
                        testimonial={t}
                        paused={isPaused}
                    />
                ))}
            </div>
        </div>
    );
}

function TestimonialCard({
    testimonial,
    paused,
}: {
    testimonial: FullTestimonial;
    paused: boolean;
}) {
    const avatarUrl = testimonial.avatarKey
        ? generateUploadThingURL(testimonial.avatarKey)
        : null;

    return (
        <article
            className={cn(
                "group relative flex w-[340px] shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6",
                "backdrop-blur-sm transition-colors duration-300",
                paused && "hover:border-highlight/40 hover:bg-white/[0.06]"
            )}
        >
            <Icons.Sparkle
                weight="fill"
                className="text-highlight/30 absolute top-4 right-4 size-7"
            />

            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Icons.Star
                        key={i}
                        weight={i < testimonial.rating ? "fill" : "regular"}
                        className={cn(
                            "size-4",
                            i < testimonial.rating
                                ? "text-highlight"
                                : "text-white/20"
                        )}
                    />
                ))}
            </div>

            <p className="line-clamp-4 text-sm leading-relaxed text-white/80">
                &ldquo;{testimonial.feedback}&rdquo;
            </p>

            <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="bg-muted/30 relative size-10 shrink-0 overflow-hidden rounded-full">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={testimonial.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-sm font-semibold text-white/70 uppercase">
                            {testimonial.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                        {testimonial.name}
                    </p>
                    <p className="truncate text-xs text-white/55">
                        {testimonial.country
                            ? testimonial.country
                            : testimonial.course?.title
                              ? `Student — ${testimonial.course.title}`
                              : "Student"}
                    </p>
                </div>
            </div>
        </article>
    );
}
