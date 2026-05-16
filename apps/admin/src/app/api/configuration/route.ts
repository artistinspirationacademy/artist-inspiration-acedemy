import {
    CResponse,
    handleError,
    updateConfigurationSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        const data = await queries.configuration.get();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const values = updateConfigurationSchema.parse(body);

        const data = await queries.configuration.update(values);
        await cache.home.drop();
        await cache.logs.add({
            type: "configuration",
            message: "Configuration updated",
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
