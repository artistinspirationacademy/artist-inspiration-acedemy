"use client";

import { cn, Icons, siteConfig, type IconName } from "@workspace/config";
import { motion } from "motion/react";
import Link from "next/link";

const socialIconMap: Record<string, IconName> = {
    Facebook: "Facebook",
    Instagram: "Instagram",
    YouTube: "YouTube",
    LinkedIn: "LinkedIn",
};

export function ContactPage() {
    return (
        <section className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <BackgroundAura />

            <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
                <ContactHeader />

                <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
                    <PrimaryMethods />
                    <SecondaryGrid />
                    <ContactCta />
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

function ContactHeader() {
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
                Contact us
            </span>

            <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                Let&rsquo;s start a{" "}
                <span className="relative inline-block">
                    <span
                        aria-hidden
                        className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                    />
                    <span className="text-highlight">conversation</span>
                </span>
            </h1>

            <p className="max-w-2xl text-base text-balance text-white/80 sm:text-lg">
                Whether you&rsquo;re curious about a course, want to collaborate,
                or just have a question — we&rsquo;d love to hear from you.
            </p>
        </motion.div>
    );
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

function PrimaryMethods() {
    return (
        <FadeIn>
            <SectionTitle>Reach us directly</SectionTitle>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link
                    href={`mailto:${siteConfig.contact}`}
                    className={cn(
                        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8",
                        "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
                    )}
                >
                    <div
                        aria-hidden
                        className="bg-highlight/15 absolute -top-20 -right-12 size-48 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <div className="relative flex items-start gap-4">
                        <div className="bg-highlight/10 border-highlight/30 flex size-12 shrink-0 items-center justify-center rounded-full border">
                            <Icons.Envelope
                                weight="duotone"
                                className="text-highlight size-6"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                                Email us
                            </p>
                            <p className="text-lg font-semibold text-white sm:text-xl">
                                {siteConfig.contact}
                            </p>
                            <p className="text-sm text-white/65">
                                We typically reply within 24 hours.
                            </p>
                        </div>
                        <Icons.ArrowRight
                            weight="bold"
                            className="text-highlight ml-auto size-4 shrink-0 translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </div>
                </Link>

                <Link
                    href="/booking"
                    className={cn(
                        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8",
                        "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
                    )}
                >
                    <div
                        aria-hidden
                        className="bg-highlight/15 absolute -top-20 -right-12 size-48 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <div className="relative flex items-start gap-4">
                        <div className="bg-highlight/10 border-highlight/30 flex size-12 shrink-0 items-center justify-center rounded-full border">
                            <Icons.Phone
                                weight="duotone"
                                className="text-highlight size-6"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                                Book a call
                            </p>
                            <p className="text-lg font-semibold text-white sm:text-xl">
                                15-minute free intro
                            </p>
                            <p className="text-sm text-white/65">
                                Talk to a mentor and pick the right track.
                            </p>
                        </div>
                        <Icons.ArrowRight
                            weight="bold"
                            className="text-highlight ml-auto size-4 shrink-0 translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </div>
                </Link>
            </div>
        </FadeIn>
    );
}

function SecondaryGrid() {
    const socials = Object.entries(siteConfig.links ?? {}).filter(
        ([, href]) => typeof href === "string"
    ) as [string, string][];

    return (
        <FadeIn delay={0.05}>
            <SectionTitle>Find us elsewhere</SectionTitle>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div
                    className={cn(
                        "rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md",
                        "transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]"
                    )}
                >
                    <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                        Response time
                    </p>
                    <p className="mt-2 text-base text-white/90 sm:text-lg">
                        Within 24 hours, Mon&ndash;Fri.
                    </p>
                </div>

                <div
                    className={cn(
                        "rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md",
                        "transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]"
                    )}
                >
                    <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                        Partnerships
                    </p>
                    <p className="mt-2 text-base text-white/90 sm:text-lg">
                        Mention &ldquo;collab&rdquo; in the subject line.
                    </p>
                </div>

                <div
                    className={cn(
                        "rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md",
                        "transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07]"
                    )}
                >
                    <p className="text-xs tracking-[0.18em] text-white/50 uppercase">
                        Press &amp; media
                    </p>
                    <p className="mt-2 text-base text-white/90 sm:text-lg">
                        We&rsquo;re happy to share assets and quotes.
                    </p>
                </div>
            </div>

            {socials.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <p className="text-muted-foreground mr-2 text-sm text-white/60">
                        Or DM us on
                    </p>
                    {socials.map(([name, href]) => {
                        const iconKey = socialIconMap[name];
                        const Icon = iconKey ? Icons[iconKey] : Icons.ArrowRight;
                        return (
                            <Link
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={name}
                                className={cn(
                                    "border-white/15 inline-flex size-10 items-center justify-center rounded-full border bg-white/[0.04] backdrop-blur-md",
                                    "text-white/80 hover:text-highlight hover:border-highlight/40 hover:bg-highlight/5",
                                    "transition-all duration-200"
                                )}
                            >
                                <Icon className="size-4" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </FadeIn>
    );
}

function ContactCta() {
    return (
        <FadeIn delay={0.1}>
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
                            Ready to take the next step?
                        </h3>
                        <p className="mt-2 text-sm text-white/70 sm:text-base">
                            Skip the back-and-forth — book a free intro call and
                            we&rsquo;ll map out your path.
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
                        Book a Free Call
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
