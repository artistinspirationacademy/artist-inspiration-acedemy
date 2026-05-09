export const siteConfig: SiteConfig = {
    name: "Artist Inspiration Academy",
    description:
        "A course platform for artists to learn about music production, marketing, and business.",
    longDescription:
        "Artist Inspiration Academy is a comprehensive online course platform designed to empower artists with the knowledge and skills they need to succeed in the music industry. Our courses cover a wide range of topics, including music production, marketing strategies, and business essentials, all tailored to help artists thrive in their careers.",
    category: "Education",
    og: {
        url: "/og-image.webp",
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
        X: "#",
        LinkedIn: "#",
        YouTube: "#",
    },
    contact: "contact@artist-inspiration-academy.com",
    menu: [
        {
            name: "About",
            href: "/about",
            icon: "Users",
        },
        {
            name: "Courses",
            href: "/courses",
            icon: "Eye",
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
                    title: "Analytics",
                    url: "/analytics",
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
                    title: "Banners",
                    url: "/banners",
                },
                {
                    title: "Courses",
                    url: "/courses",
                },
                {
                    title: "Team",
                    url: "/team",
                },
                {
                    title: "Testimonials",
                    url: "/testimonials",
                },
                {
                    title: "Contact",
                    url: "/contact",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: "Gear",
            items: [
                {
                    title: "Preferences",
                    url: "/preferences",
                },
                {
                    title: "Profile",
                    url: "/profile",
                },
            ],
        },
    ],
};
