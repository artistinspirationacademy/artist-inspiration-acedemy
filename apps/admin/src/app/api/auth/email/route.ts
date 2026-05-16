import { AUTH_COOKIE_NAME } from "@/config/const";
import { auth } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateEmailSchema,
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
        const { email, currentPassword } = updateEmailSchema.parse(body);

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

        if (email === existing.email)
            throw new AppError(
                "New email must be different from your current email",
                "BAD_REQUEST"
            );

        const emailOwner = await queries.user.get({ email });
        if (emailOwner && emailOwner.id !== existing.id)
            throw new AppError(
                "An account with this email already exists",
                "CONFLICT"
            );

        const data = await queries.user.updateEmail({
            id: existing.id,
            email,
        });

        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE_NAME);

        await cache.logs.add({
            type: "auth",
            message: "Email updated",
            level: "info",
            actorId: existing.id,
            metadata: { newEmail: email },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
