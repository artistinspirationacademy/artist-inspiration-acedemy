import { cache } from "@workspace/cache";
import { CResponse, handleError, replaceAboutSchema } from "@workspace/config";
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
        await cache.logs.add({
            type: "about",
            message: "About sections replaced",
            metadata: { count: sections.length },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
