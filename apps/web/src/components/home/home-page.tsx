"use client";

import { useHome } from "@/lib/rq";
import { CtaSection } from "./cta-section";
import { FeaturesSection } from "./features-section";
import { HeroCarousel } from "./hero-carousel";
import { HowItWorksSection } from "./how-it-works-section";
import { StatsSection } from "./stats-section";
import { TestimonialsSection } from "./testimonials-section";

export function HomePage() {
    const { useGet } = useHome();
    const { data, isPending } = useGet({});

    return (
        <>
            <HeroCarousel
                banners={data?.banners ?? []}
                content={data?.bannerContent ?? null}
                isLoading={isPending}
            />
            <StatsSection configuration={data?.configuration ?? null} />
            <FeaturesSection
                features={data?.features ?? []}
                isLoading={isPending}
            />
            <HowItWorksSection />
            <TestimonialsSection
                testimonials={data?.testimonials ?? []}
                isLoading={isPending}
            />
            <CtaSection />
        </>
    );
}
