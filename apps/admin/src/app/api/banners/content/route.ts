import { cache } from "@workspace/cache";
import {
    createBannerContentSchema,
    CResponse,
    handleError,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        const data = await queries.banner.content.get();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createBannerContentSchema.parse(body);

        const data = await queries.banner.content.update(parsed);
        await cache.home.drop();
        await cache.logs.add({
            type: "banner",
            message: "Banner content updated",
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
