"use client";

import {
    Banner,
    BannerContent,
    cn,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDE_DURATION_MS = 5000;

interface HeroCarouselProps {
    banners: Banner[];
    content: BannerContent | null;
    isLoading?: boolean;
}

export function HeroCarousel({
    banners,
    content,
    isLoading,
}: HeroCarouselProps) {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const safeIndex = banners.length ? index % banners.length : 0;
    const current = banners[safeIndex];

    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const id = setInterval(() => {
            setIndex((i) => (i + 1) % banners.length);
        }, SLIDE_DURATION_MS);

        return () => clearInterval(id);
    }, [banners.length, isPaused]);

    return (
        <section
            className="relative h-svh w-full overflow-hidden bg-neutral-900"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute inset-0">
                <AnimatePresence mode="sync">
                    {current && (
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1 }}
                            transition={{
                                opacity: { duration: 1.2, ease: "easeInOut" },
                                scale: { duration: 1.6, ease: "easeOut" },
                            }}
                            className="absolute inset-0"
                        >
                            <HeroSlide banner={current} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.65)_60%,rgba(0,0,0,0.85)_100%)]" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/70" />

                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white/45 via-white/15 to-transparent sm:h-40" />
            </div>

            <div className="relative z-10 flex h-full w-full items-center justify-center px-4 sm:px-6">
                <HeroContent content={content} />
            </div>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        key="hero-curtain"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-950"
                    >
                        <EqualizerLoader />
                    </motion.div>
                )}
            </AnimatePresence>

            {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-10">
                    {banners.map((b, i) => (
                        <button
                            key={b.id}
                            type="button"
                            aria-label={`Show slide ${i + 1}`}
                            aria-current={i === safeIndex}
                            onClick={() => setIndex(i)}
                            className={cn(
                                "h-1.5 rounded-full bg-white/40 transition-all duration-500",
                                i === safeIndex
                                    ? "bg-highlight w-10"
                                    : "w-2 hover:bg-white/70"
                            )}
                        />
                    ))}
                </div>
            )}

            <div className="absolute right-0 bottom-6 left-0 z-10 flex justify-center text-[10px] tracking-[0.3em] text-white/60 uppercase sm:right-8 sm:bottom-8 sm:left-auto sm:justify-end sm:text-xs">
                <span className="hidden sm:inline">Scroll to explore</span>
            </div>
        </section>
    );
}

function HeroSlide({ banner }: { banner: Banner }) {
    const url = generateUploadThingURL(banner.mediaKey);

    if (banner.mediaType === "video") {
        return (
            <video
                key={url}
                src={url}
                autoPlay
                muted
                loop
                playsInline
                poster={`${url}#t=0.5`}
                className="size-full object-cover"
            />
        );
    }

    return (
        <Image
            src={url}
            alt={banner.name}
            fill
            priority
            sizes="100vw"
            className="animate-hero-kenburns size-full object-cover"
            unoptimized
        />
    );
}

function HeroContent({ content }: { content: BannerContent | null }) {
    const title = content?.title ?? "Find your sound";
    const description =
        content?.description ??
        "Master music production, marketing, and the business of being an artist with mentors who've shipped real work.";
    const tagline = content?.content ?? "Artist Inspiration Academy";

    return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-5 text-center sm:gap-7">
            <span
                className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1",
                    "text-xs font-semibold tracking-[0.25em] text-white/90 uppercase",
                    "backdrop-blur-md"
                )}
            >
                <Icons.Sparkle
                    weight="fill"
                    className="text-highlight size-3"
                />
                {tagline}
            </span>

            <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                {renderTitleWithHighlight(title)}
            </h1>

            <p className="max-w-2xl text-base text-balance text-white/85 drop-shadow-md sm:text-lg">
                {description}
            </p>

            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <Link
                    href="/booking"
                    className={cn(
                        "group inline-flex h-12 items-center gap-2 rounded-full px-7",
                        "bg-highlight text-highlight-foreground font-semibold",
                        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40",
                        "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                    )}
                >
                    Book Now
                    <Icons.ArrowRight
                        weight="bold"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                </Link>

                <Link
                    href="/courses"
                    className={cn(
                        "inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7",
                        "font-semibold text-white backdrop-blur-md",
                        "transition-all duration-300 ease-out hover:bg-white/15",
                        "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                    )}
                >
                    Explore Courses
                </Link>
            </div>
        </div>
    );
}

function EqualizerLoader() {
    const bars = [0, 1, 2, 3, 4];
    return (
        <div
            className="flex h-12 items-center gap-1.5"
            role="status"
            aria-label="Loading"
        >
            {bars.map((i) => (
                <motion.span
                    key={i}
                    className="bg-highlight w-1 rounded-full"
                    style={{ height: 40 }}
                    animate={{ scaleY: [0.2, 1, 0.4, 0.85, 0.25] }}
                    transition={{
                        duration: 1.1,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: i * 0.12,
                    }}
                />
            ))}
        </div>
    );
}

function renderTitleWithHighlight(title: string) {
    const words = title.trim().split(/\s+/);
    if (words.length <= 1) return title;

    const last = words[words.length - 1];
    const rest = words.slice(0, -1).join(" ");

    return (
        <>
            {rest}{" "}
            <span className="relative inline-block">
                <span
                    aria-hidden
                    className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                />
                <span className="text-highlight">{last}</span>
            </span>
        </>
    );
}
