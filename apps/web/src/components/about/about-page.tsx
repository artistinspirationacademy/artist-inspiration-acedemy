"use client";

import { useAbout } from "@/lib/rq";
import {
    AboutCtaContent,
    AboutImageTextContent,
    AboutQuoteContent,
    AboutSection,
    cn,
    generateUploadThingURL,
    Icons,
} from "@workspace/config";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export function AboutPage() {
    const { useGet } = useAbout();
    const { data, isPending } = useGet();

    const sections = useMemo(
        () =>
            (data ?? [])
                .slice()
                .sort((a, b) => a.position - b.position),
        [data]
    );

    return (
        <section className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <BackgroundAura />

            <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
                <AboutHeader hasSections={sections.length > 0} />

                <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
                    {isPending ? (
                        <AboutSkeleton />
                    ) : sections.length === 0 ? (
                        <EmptyState />
                    ) : (
                        sections.map((section, index) => (
                            <SectionRenderer
                                key={section.id}
                                section={section}
                                index={index}
                            />
                        ))
                    )}
                </div>
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

function AboutHeader({ hasSections }: { hasSections: boolean }) {
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
                <Icons.Sparkle weight="fill" className="text-highlight size-3" />
                About us
            </span>

            <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                The story behind{" "}
                <span className="relative inline-block">
                    <span
                        aria-hidden
                        className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                    />
                    <span className="text-highlight">the academy</span>
                </span>
            </h1>

            {!hasSections && (
                <p className="max-w-2xl text-base text-balance text-white/80 sm:text-lg">
                    Built to help working artists find their craft, their voice,
                    and their audience.
                </p>
            )}
        </motion.div>
    );
}

function SectionRenderer({
    section,
    index,
}: {
    section: AboutSection;
    index: number;
}) {
    const delay = Math.min(index * 0.05, 0.25);

    switch (section.type) {
        case "text":
            return (
                <TextSection
                    title={section.title}
                    content={section.content}
                    delay={delay}
                />
            );
        case "image":
            return (
                <ImageSection
                    title={section.title}
                    content={section.content}
                    delay={delay}
                />
            );
        case "image_text":
            return (
                <ImageTextSection
                    title={section.title}
                    content={section.content}
                    reverse={false}
                    delay={delay}
                />
            );
        case "image_text_reverse":
            return (
                <ImageTextSection
                    title={section.title}
                    content={section.content}
                    reverse
                    delay={delay}
                />
            );
        case "accordion":
            return (
                <AccordionSection
                    title={section.title}
                    items={section.content}
                    delay={delay}
                />
            );
        case "grid":
            return (
                <GridSection
                    title={section.title}
                    items={section.content}
                    delay={delay}
                />
            );
        case "quote":
            return (
                <QuoteSection
                    content={section.content}
                    delay={delay}
                />
            );
        case "cta":
            return (
                <CtaSection content={section.content} delay={delay} />
            );
        default:
            return null;
    }
}

function FadeIn({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-5 flex items-baseline gap-3">
            <span className="bg-highlight inline-block size-2 rounded-full" />
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {children}
            </h2>
        </div>
    );
}

function TextSection({
    title,
    content,
    delay,
}: {
    title: string;
    content: string;
    delay: number;
}) {
    return (
        <FadeIn delay={delay}>
            <SectionTitle>{title}</SectionTitle>
            <p className="text-base leading-relaxed whitespace-pre-line text-white/80 sm:text-lg">
                {content}
            </p>
        </FadeIn>
    );
}

function ImageSection({
    title,
    content,
    delay,
}: {
    title: string;
    content: string;
    delay: number;
}) {
    const url = content ? generateUploadThingURL(content) : null;
    if (!url) return null;

    return (
        <FadeIn delay={delay}>
            <SectionTitle>{title}</SectionTitle>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 sm:aspect-[21/9]">
                <Image
                    src={url}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 64rem, 100vw"
                    className="size-full object-cover"
                    unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>
        </FadeIn>
    );
}

function ImageTextSection({
    title,
    content,
    reverse,
    delay,
}: {
    title: string;
    content: AboutImageTextContent;
    reverse: boolean;
    delay: number;
}) {
    const url = content.imageKey
        ? generateUploadThingURL(content.imageKey)
        : null;

    return (
        <FadeIn delay={delay}>
            <SectionTitle>{title}</SectionTitle>

            <div
                className={cn(
                    "grid gap-6 sm:gap-10 md:grid-cols-2 md:items-center",
                    reverse && "md:[&>div:first-child]:order-2"
                )}
            >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 md:aspect-square">
                    {url && (
                        <Image
                            src={url}
                            alt={content.heading || title}
                            fill
                            sizes="(min-width: 768px) 32rem, 100vw"
                            className="size-full object-cover"
                            unoptimized
                        />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                </div>

                <div className="space-y-4">
                    {content.heading && (
                        <h3 className="text-2xl leading-tight font-semibold text-white sm:text-3xl">
                            {content.heading}
                        </h3>
                    )}
                    <p className="text-base leading-relaxed whitespace-pre-line text-white/80 sm:text-lg">
                        {content.text}
                    </p>
                </div>
            </div>
        </FadeIn>
    );
}

function AccordionSection({
    title,
    items,
    delay,
}: {
    title: string;
    items: { key: string; value: string }[];
    delay: number;
}) {
    if (!items.length) return null;

    return (
        <FadeIn delay={delay}>
            <SectionTitle>{title}</SectionTitle>

            <div className="space-y-2">
                {items.map((item, i) => (
                    <details
                        key={`${title}-${i}`}
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
                            {item.key}
                            <Icons.ArrowRight
                                weight="bold"
                                className="text-highlight size-4 shrink-0 transition-transform duration-300 group-open:rotate-90"
                            />
                        </summary>
                        <div className="px-5 pb-4 text-sm leading-relaxed whitespace-pre-line text-white/75">
                            {item.value}
                        </div>
                    </details>
                ))}
            </div>
        </FadeIn>
    );
}

function GridSection({
    title,
    items,
    delay,
}: {
    title: string;
    items: { key: string; value: string }[];
    delay: number;
}) {
    if (!items.length) return null;

    return (
        <FadeIn delay={delay}>
            <SectionTitle>{title}</SectionTitle>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {items.map((item, i) => (
                    <div
                        key={`${title}-${i}`}
                        className={cn(
                            "rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md",
                            "transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]"
                        )}
                    >
                        <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                            {item.key}
                        </p>
                        <p className="mt-2 text-base text-white/90 sm:text-lg">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </FadeIn>
    );
}

function QuoteSection({
    content,
    delay,
}: {
    content: AboutQuoteContent;
    delay: number;
}) {
    return (
        <FadeIn delay={delay}>
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md sm:p-12">
                <Icons.Sparkle
                    weight="fill"
                    className="text-highlight/70 absolute -top-3 left-8 size-6"
                />
                <blockquote className="text-xl leading-relaxed font-medium text-balance text-white/95 sm:text-2xl">
                    &ldquo;{content.text}&rdquo;
                </blockquote>

                {(content.author || content.role) && (
                    <footer className="mt-6 flex items-center gap-3 text-sm">
                        <span className="bg-highlight inline-block h-px w-8" />
                        <div>
                            {content.author && (
                                <p className="font-semibold text-white">
                                    {content.author}
                                </p>
                            )}
                            {content.role && (
                                <p className="text-white/60">{content.role}</p>
                            )}
                        </div>
                    </footer>
                )}
            </div>
        </FadeIn>
    );
}

function CtaSection({
    content,
    delay,
}: {
    content: AboutCtaContent;
    delay: number;
}) {
    return (
        <FadeIn delay={delay}>
            <div
                className={cn(
                    "relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12",
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
                            {content.heading}
                        </h3>
                        {content.description && (
                            <p className="mt-2 text-sm text-white/70 sm:text-base">
                                {content.description}
                            </p>
                        )}
                    </div>

                    <Link
                        href={content.buttonLink}
                        className={cn(
                            "group inline-flex h-12 items-center gap-2 rounded-full px-7",
                            "bg-highlight text-highlight-foreground font-semibold whitespace-nowrap",
                            "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40",
                            "focus-visible:ring-highlight/60 focus-visible:ring-2 focus-visible:outline-none"
                        )}
                    >
                        {content.buttonText}
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>
            </div>
        </FadeIn>
    );
}

function AboutSkeleton() {
    return (
        <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="h-6 w-1/3 animate-pulse rounded-md bg-white/10" />
                    <div className="h-3 w-full animate-pulse rounded-md bg-white/[0.05]" />
                    <div className="h-3 w-5/6 animate-pulse rounded-md bg-white/[0.05]" />
                    <div className="h-3 w-2/3 animate-pulse rounded-md bg-white/[0.05]" />
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
            className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center"
        >
            <div className="relative flex size-24 items-center justify-center">
                <div className="bg-highlight/20 absolute inset-0 rounded-full blur-2xl" />
                <div className="relative flex size-24 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
                    <Icons.Info
                        weight="duotone"
                        className="text-highlight size-10"
                    />
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Story coming soon
            </h2>
            <p className="text-white/70">
                We&rsquo;re finalising the words for this page. Check back in a
                moment.
            </p>
        </motion.div>
    );
}
