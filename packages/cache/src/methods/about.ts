import {
    AboutSection,
    aboutSectionSchema,
    parseToJSON,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { redis } from "../client";

const key = "about";

class AboutCache {
    async get(): Promise<AboutSection[]> {
        const cachedRaw = await redis.get(key);
        let cached = aboutSectionSchema
            .array()
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const all = await queries.about.scan();
            cached = all.filter((s) => s.isActive);
            await redis.set(key, JSON.stringify(cached));
        }

        return cached;
    }

    async drop() {
        await redis.del(key);
    }
}

export const aboutCache = new AboutCache();
