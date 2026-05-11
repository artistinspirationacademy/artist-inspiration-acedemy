import { cn, Icons, siteConfig, type IconName } from "@workspace/config";
import Image from "next/image";
import Link from "next/link";
import { DetailedHTMLProps, HTMLAttributes } from "react";

type FooterProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

const socialIconMap: Record<string, IconName> = {
    Facebook: "Facebook",
    Instagram: "Instagram",
    YouTube: "YouTube",
    LinkedIn: "LinkedIn",
};

export function Footer({ className, ...props }: FooterProps) {
    const socials = Object.entries(siteConfig.links ?? {}).filter(
        ([, href]) => typeof href === "string"
    ) as [string, string][];

    return (
        <footer
            className={cn(
                "border-border/60 bg-background relative mt-24 border-t",
                className
            )}
            {...props}
        >
            {/* Subtle highlight strip at the top */}
            <div
                aria-hidden
                className="from-highlight/0 via-highlight/40 to-highlight/0 absolute inset-x-0 top-0 h-px bg-linear-to-r"
            />

            <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4 lg:col-span-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5"
                        >
                            <Image
                                src="/aia.png"
                                alt="AIA Logo"
                                width={36}
                                height={36}
                                className="size-9"
                            />
                            <span className="text-lg font-bold tracking-tight">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                            {siteConfig.description}
                        </p>

                        <Link
                            href={`mailto:${siteConfig.contact}`}
                            className="text-muted-foreground hover:text-highlight inline-flex items-center gap-2 text-sm transition-colors"
                        >
                            <Icons.Envelope className="size-4" />
                            {siteConfig.contact}
                        </Link>
                    </div>

                    {/* Explore */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                            Explore
                        </h3>
                        <ul className="space-y-2">
                            {siteConfig.menu.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        target={
                                            item.isExternal
                                                ? "_blank"
                                                : undefined
                                        }
                                        rel={
                                            item.isExternal
                                                ? "noreferrer noopener"
                                                : undefined
                                        }
                                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/booking"
                                    className="text-highlight hover:text-highlight/80 text-sm font-medium transition-colors"
                                >
                                    Book a session →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                            Connect
                        </h3>
                        <ul className="flex flex-wrap gap-2">
                            {socials.map(([name, href]) => {
                                const iconKey = socialIconMap[name];
                                const Icon = iconKey
                                    ? Icons[iconKey]
                                    : Icons.ArrowRight;
                                return (
                                    <li key={name}>
                                        <Link
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            aria-label={name}
                                            className={cn(
                                                "border-border/60 inline-flex size-10 items-center justify-center rounded-full border",
                                                "text-muted-foreground hover:text-highlight hover:border-highlight/40 hover:bg-highlight/5",
                                                "transition-all duration-200"
                                            )}
                                        >
                                            <Icon className="size-4" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="text-muted-foreground pt-2 text-xs leading-relaxed">
                            Get inspired weekly. Follow us for new lessons,
                            tips, and stories.
                        </p>
                    </div>
                </div>

                <div className="border-border/60 mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
                    <p className="text-muted-foreground text-xs">
                        &copy; {new Date().getFullYear()}{" "}
                        <span className="font-medium">{siteConfig.name}</span>.
                        All rights reserved.
                    </p>
                    <p className="text-muted-foreground text-xs">
                        Crafted by{" "}
                        <Link
                            href={siteConfig.developer.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-highlight font-medium underline-offset-4 hover:underline"
                        >
                            {siteConfig.developer.name}
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
