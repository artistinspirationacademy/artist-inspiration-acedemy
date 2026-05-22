import { runArchive } from "@/lib/logs/archive";
import { CResponse, handleError } from "@workspace/config";

export async function POST() {
    try {
        const data = await runArchive();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
