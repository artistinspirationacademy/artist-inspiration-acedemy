import { cache } from "@workspace/cache";
import { CResponse, handleError } from "@workspace/config";

export async function GET() {
    try {
        const count = await cache.notification.getUnreadCount();
        return CResponse({ data: { count } });
    } catch (err) {
        return handleError(err);
    }
}
