import { cache } from "@workspace/cache";
import { CResponse, handleError } from "@workspace/config";

export async function GET() {
    try {
        const data = await cache.home.get();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
