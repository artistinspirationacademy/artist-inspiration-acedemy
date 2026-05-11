import "@workspace/config";
import "./globals.css";
import { ClientProvider } from "@/components/providers";
import { cn, getAbsoluteURL, siteConfig } from "@workspace/config";
import { Metadata, Viewport } from "next";
import { fontMono, nunitoSans } from "./font";

export const viewport: Viewport = {
    themeColor: [{ media: "(prefers-color-scheme: light)", color: "white" }],
    colorScheme: "light",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: "%s - " + siteConfig.name,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [siteConfig.developer],
    publisher: `${siteConfig.name} Team`,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    referrer: "origin-when-cross-origin",
    category: siteConfig.category,
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: siteConfig.name,
    },
    creator: siteConfig.name,
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        url: getAbsoluteURL(),
        siteName: siteConfig.name,
        images: [
            {
                ...siteConfig.og,
                alt: siteConfig.name,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    icons: {
        icon: [
            {
                url: "/favicon.ico",
                sizes: "32x32",
                type: "image/x-icon",
            },
            {
                url: "/icon1.png",
                sizes: "96x96",
                type: "image/png",
            },
        ],
        apple: "/apple-icon.png",
    },
    manifest: "/manifest.json",
    metadataBase: new URL(getAbsoluteURL()),
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                "h-full",
                "antialiased",
                fontMono.variable,
                "font-sans",
                nunitoSans.variable
            )}
        >
            <body className="flex min-h-full flex-col">
                <ClientProvider>{children}</ClientProvider>
            </body>
        </html>
    );
}
