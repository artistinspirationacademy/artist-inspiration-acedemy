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
        const tRedis = Date.now();
        const cachedRaw = await redis.get(key);
        console.log(`[dashboard] redis.get in ${Date.now() - tRedis}ms`);

        const parsed = dashboardStatsSchema
            .nullable()
            .safeParse(parseToJSON(cachedRaw));
        if (parsed.success && parsed.data) {
            console.log("[dashboard] cache hit");
            return parsed.data;
        }
        console.log("[dashboard] cache miss, fetching fresh");

        const tFresh = Date.now();
        const fresh = await queries.dashboard.getStats();
        console.log(`[dashboard] getStats in ${Date.now() - tFresh}ms`);

        const tSet = Date.now();
        await redis.set(key, JSON.stringify(fresh), "EX", TTL_SECONDS);
        console.log(`[dashboard] redis.set in ${Date.now() - tSet}ms`);
        return fresh;
    }

    async drop() {
        await redis.del(key);
    }
}

export const dashboardCache = new DashboardCache();
