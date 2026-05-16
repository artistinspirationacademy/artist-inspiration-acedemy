import { AUTH_COOKIE_NAME } from "@/config/const";
import { auth } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updatePasswordSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const isAuth = await auth();
        if (!isAuth)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const body = await req.json();
        const { currentPassword, newPassword } =
            updatePasswordSchema.parse(body);

        const existing = await queries.user.get({
            id: isAuth.user!.id,
            safeParse: false,
        });
        if (!existing)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            existing.password
        );
        if (!isPasswordValid)
            throw new AppError(
                MESSAGES.ERRORS.AUTH.INVALID_CREDENTIALS,
                "FORBIDDEN"
            );

        const passwordHash = await bcrypt.hash(newPassword, 10);
        const data = await queries.user.updatePassword({
            id: existing.id,
            passwordHash,
        });

        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE_NAME);

        await cache.logs.add({
            type: "auth",
            message: "Password updated",
            level: "info",
            actorId: existing.id,
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
