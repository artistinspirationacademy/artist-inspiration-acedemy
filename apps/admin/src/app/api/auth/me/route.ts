import { auth } from "@/lib/jwt";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateProfileSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        const isAuth = await auth();
        if (!isAuth)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const existingData = await queries.user.get({ id: isAuth.user!.id });
        if (!existingData)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        return CResponse({ data: existingData });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const isAuth = await auth();
        if (!isAuth)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const body = await req.json();
        const values = updateProfileSchema.parse(body);

        const existing = await queries.user.get({ id: isAuth.user!.id });
        if (!existing)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const data = await queries.user.updateProfile({
            id: existing.id,
            values,
        });

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
