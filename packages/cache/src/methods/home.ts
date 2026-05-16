import { queries } from "@workspace/db";
import { homeSchema, parseToJSON } from "@workspace/config";
import { redis } from "../client";

const key = "home";

class HomeCache {
    async get() {
        const cachedRaw = await redis.get(key);
        const parsed = homeSchema.nullable().safeParse(parseToJSON(cachedRaw));
        let cached = parsed.success ? parsed.data : null;

        if (!cached) {
            const [
                existingBanners,
                existingBannerContent,
                existingFeatures,
                existingTestimonials,
                existingConfiguration,
            ] = await Promise.all([
                queries.banner.scan({ isActive: true }),
                queries.banner.content.get(),
                queries.feature.scan({ isActive: true }),
                queries.testimonial.scan({ isActive: true }),
                queries.configuration.get(),
            ]);

            cached = {
                banners: existingBanners,
                bannerContent: existingBannerContent,
                features: existingFeatures,
                testimonials: existingTestimonials,
                configuration: existingConfiguration,
            };

            await redis.set(key, JSON.stringify(cached));
        }

        return cached;
    }

    async drop() {
        await redis.del(key);
    }
}

export const homeCache = new HomeCache();
