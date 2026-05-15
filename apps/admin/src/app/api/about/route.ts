import {
    CResponse,
    handleError,
    replaceAboutSchema,
} from "@workspace/config";
import { cache } from "@workspace/cache";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        const data = await queries.about.scan();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { sections } = replaceAboutSchema.parse(body);

        const data = await queries.about.replace(sections);
        await cache.about.drop();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
