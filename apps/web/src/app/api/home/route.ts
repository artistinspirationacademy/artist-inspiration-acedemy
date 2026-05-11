import { CResponse, handleError } from "@workspace/config";
import { cache } from "@workspace/cache";

export async function GET() {
    try {
        const data = await cache.home.get();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
