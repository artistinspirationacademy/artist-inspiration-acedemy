import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateNotificationSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const data = await queries.notification.get({
            id,
            include: "booking",
        });
        if (!data)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.NOT_FOUND,
                "NOT_FOUND"
            );
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const values = updateNotificationSchema.parse(await req.json());

        const existing = await queries.notification.get({ id });
        if (!existing)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.NOT_FOUND,
                "NOT_FOUND"
            );

        const data = await queries.notification.update({ id, values });
        await cache.notification.drop();

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
