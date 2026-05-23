import { getAbsoluteURL } from "./utils";

export const siteConfig: SiteConfig = {
    name: "Artist Inspiration Academy",
    description:
        "A course platform for artists to learn about music production, marketing, and business.",
    longDescription:
        "Artist Inspiration Academy is a comprehensive online course platform designed to empower artists with the knowledge and skills they need to succeed in the music industry. Our courses cover a wide range of topics, including music production, marketing strategies, and business essentials, all tailored to help artists thrive in their careers.",
    category: "Education",
    og: {
        url: getAbsoluteURL("/og-image.webp"),
        width: 1200,
        height: 630,
    },
    developer: {
        name: "DRVGO",
        url: "https://itsdrvgo.me",
    },
    keywords: [
        "music production",
        "artist marketing",
        "music business",
        "online courses",
        "artist development",
        "music industry education",
        "artist success",
        "music promotion",
        "artist branding",
        "music entrepreneurship",
        "artist growth",
        "music career",
        "artist resources",
        "music education",
        "artist community",
    ],
    links: {
        Facebook: "#",
        Instagram: "#",
        YouTube: "#",
    },
    contact: "contact@artistinspiration.academy",
    menu: [
        {
            name: "Courses",
            href: "/courses",
            icon: "Eye",
        },
        {
            name: "Teachers",
            href: "/teachers",
            icon: "Teacher",
        },
        {
            name: "About",
            href: "/about",
            icon: "Users",
        },
        {
            name: "Contact",
            href: "/contact",
            icon: "Phone",
        },
    ],
    sidebar: [
        {
            title: "General",
            url: "#",
            icon: "House",
            items: [
                {
                    title: "Dashboard",
                    url: "/",
                },
                {
                    title: "Logs",
                    url: "/logs",
                },
            ],
        },
        {
            title: "Management",
            url: "#",
            icon: "Layout",
            items: [
                {
                    title: "About",
                    url: "/about",
                },
                {
                    title: "Banners",
                    url: "/banners",
                },
                {
                    title: "Bookings",
                    url: "/bookings",
                },
                {
                    title: "Courses",
                    url: "/courses",
                },
                {
                    title: "Features",
                    url: "/features",
                },
                {
                    title: "Media",
                    url: "/media",
                },
                {
                    title: "Teachers",
                    url: "/teachers",
                },
                {
                    title: "Testimonials",
                    url: "/testimonials",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: "Gear",
            items: [
                {
                    title: "Configuration",
                    url: "/configuration",
                },
                {
                    title: "Profile",
                    url: "/profile",
                },
            ],
        },
    ],
};
