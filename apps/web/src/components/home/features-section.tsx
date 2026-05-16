"use client";

import {
    cn,
    Feature,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import { motion } from "motion/react";
import Image from "next/image";

interface FeaturesSectionProps {
    features: Feature[];
    isLoading?: boolean;
}

export function FeaturesSection({
    features,
    isLoading,
}: FeaturesSectionProps) {
    if (!isLoading && features.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-neutral-950 px-4 py-20 sm:px-6 sm:py-28">
            <div className="bg-highlight/10 pointer-events-none absolute -top-32 left-1/2 size-160 -translate-x-1/2 rounded-full blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12">
                <SectionHeader
                    eyebrow="Why us"
                    title="What makes the academy different"
                    description="Every detail of the experience is built to help you ship real work — not just consume content."
                />

                {isLoading ? (
                    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-48 animate-pulse rounded-2xl bg-white/5"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, i) => (
                            <FeatureCard
                                key={feature.id}
                                feature={feature}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function FeatureCard({
    feature,
    index,
}: {
    feature: Feature;
    index: number;
}) {
    const url = generateUploadThingURL(feature.imageKey);

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.55,
                ease: "easeOut",
                delay: index * 0.08,
            }}
            className={cn(
                "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6",
                "backdrop-blur-sm transition-all duration-500",
                "hover:border-highlight/40 hover:bg-white/[0.06]"
            )}
        >
            <div className="bg-muted/10 relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/5">
                <Image
                    src={url}
                    alt={feature.name}
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                    {feature.name}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                    {feature.description}
                </p>
            </div>
        </motion.article>
    );
}

export function SectionHeader({
    eyebrow,
    title,
    description,
    align = "center",
    tone = "dark",
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: "center" | "start";
    tone?: "dark" | "light";
}) {
    const isDark = tone === "dark";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "flex max-w-3xl flex-col gap-4",
                align === "center" ? "items-center text-center" : "items-start"
            )}
        >
            {eyebrow && (
                <span
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1",
                        "text-xs font-semibold tracking-[0.25em] uppercase backdrop-blur-md",
                        isDark
                            ? "border-white/20 bg-white/5 text-white/85"
                            : "border-black/10 bg-black/5 text-foreground/80"
                    )}
                >
                    <Icons.Sparkle
                        weight="fill"
                        className="text-highlight size-3"
                    />
                    {eyebrow}
                </span>
            )}
            <h2
                className={cn(
                    "text-3xl leading-[1.1] font-bold text-balance sm:text-4xl md:text-5xl",
                    isDark ? "text-white" : "text-foreground"
                )}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={cn(
                        "max-w-2xl text-base text-balance sm:text-lg",
                        isDark ? "text-white/70" : "text-muted-foreground"
                    )}
                >
                    {description}
                </p>
            )}
        </motion.div>
    );
}
