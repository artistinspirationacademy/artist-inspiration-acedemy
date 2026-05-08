import { Redis } from "ioredis";

const connectionString = process.env.REDIS_URL;
if (!connectionString)
    throw new Error("'REDIS_URL' environment variable is required");

export const redis = new Redis(connectionString);

export async function getAllKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = "0";

    do {
        const [nextCursor, scanKeys] = await redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            "1000"
        );
        cursor = nextCursor;
        keys.push(...scanKeys);
    } while (cursor !== "0");

    return keys;
}
