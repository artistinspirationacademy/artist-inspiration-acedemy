import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updatePlatformSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;

        const data = await queries.platform.get({ id });
        if (!data)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const body = await req.json();
        const values = updatePlatformSchema.parse(body);

        const existing = await queries.platform.get({ id });
        if (!existing)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const data = await queries.platform.update({ id, values });
        await cache.logs.add({
            type: "platform",
            message: "Platform updated",
            metadata: { id },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
