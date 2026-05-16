"use client";

import { useHome } from "@/lib/rq";
import { HeroCarousel } from "./hero-carousel";
import { FeaturesSection } from "./features-section";
import { TestimonialsSection } from "./testimonials-section";
import { StatsSection } from "./stats-section";
import { HowItWorksSection } from "./how-it-works-section";
import { CtaSection } from "./cta-section";

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
            <StatsSection />
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
