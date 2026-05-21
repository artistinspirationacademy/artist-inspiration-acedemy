import {
    DashboardStats,
    dashboardStatsSchema,
    parseToJSON,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { redis } from "../client";

const key = "dashboard:stats";
const TTL_SECONDS = 60 * 5;

class DashboardCache {
    async get(): Promise<DashboardStats> {
        const cachedRaw = await redis.get(key);
        const parsed = dashboardStatsSchema
            .nullable()
            .safeParse(parseToJSON(cachedRaw));
        if (parsed.success && parsed.data) return parsed.data;

        const fresh = await queries.dashboard.getStats();
        await redis.set(key, JSON.stringify(fresh), "EX", TTL_SECONDS);
        return fresh;
    }

    async drop() {
        await redis.del(key);
    }
}

export const dashboardCache = new DashboardCache();
