import { AppError, CResponse, handleError, MESSAGES } from "@workspace/config";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;

        const data = await cache.course.getById(id);
        if (!data || !data.isActive)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
