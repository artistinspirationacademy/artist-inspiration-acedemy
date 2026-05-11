import { queries } from "@workspace/db";
import { homeSchema, parseToJSON } from "@workspace/config";
import { redis } from "../client";

const key = "home";

class HomeCache {
    async get() {
        const cachedRaw = await redis.get(key);
        let cached = homeSchema.nullable().parse(parseToJSON(cachedRaw));

        if (!cached) {
            const existingBanners = await queries.banner.scan({
                isActive: true,
            });
            const existingBannerContent = await queries.banner.content.get();

            cached = {
                banners: existingBanners,
                bannerContent: existingBannerContent,
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
