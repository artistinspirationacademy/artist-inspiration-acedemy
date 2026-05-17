import { queries } from "@workspace/db";
import { redis } from "../client";

const unreadCountKey = "notifications:unread_count";

class NotificationCache {
    async getUnreadCount(): Promise<number> {
        const cached = await redis.get(unreadCountKey);
        if (cached !== null) {
            const parsed = Number(cached);
            if (!Number.isNaN(parsed)) return parsed;
        }

        const count = await queries.notification.unreadCount();
        await redis.set(unreadCountKey, String(count));
        return count;
    }

    async drop() {
        await redis.del(unreadCountKey);
    }
}

export const notificationCache = new NotificationCache();
