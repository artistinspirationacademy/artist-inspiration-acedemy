"use client";

import { useHome } from "@/lib/rq";
import { HeroCarousel } from "./hero-carousel";

export function HomePage() {
    const { useGet } = useHome();
    const { data, isPending } = useGet({});

    return (
        <HeroCarousel
            banners={data?.banners ?? []}
            content={data?.bannerContent ?? null}
            isLoading={isPending}
        />
    );
}
