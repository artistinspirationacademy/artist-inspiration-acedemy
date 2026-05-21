import { cache } from "@workspace/cache";
import { CResponse, handleError } from "@workspace/config";

export const maxDuration = 60;

export async function GET() {
    try {
        const data = await cache.dashboard.get();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
