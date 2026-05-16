import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateBannerSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;

        const data = await queries.banner.get({ id });
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
        const values = updateBannerSchema.parse(body);

        const existing = await queries.banner.get({ id });
        if (!existing)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const data = await queries.banner.update({ id, values });
        await cache.home.drop();
        await cache.logs.add({
            type: "banner",
            message: "Banner updated",
            metadata: { id },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
