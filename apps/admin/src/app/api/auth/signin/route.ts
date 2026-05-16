import { AUTH_COOKIE_NAME } from "@/config/const";
import { signToken } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    safeUserSchema,
    signInSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = signInSchema.parse(body);

        const existingData = await queries.user.get({
            email,
            safeParse: false,
        });
        if (!existingData)
            throw new AppError(
                MESSAGES.ERRORS.AUTH.INVALID_CREDENTIALS,
                "UNAUTHORIZED"
            );

        const isPasswordValid = await bcrypt.compare(
            password,
            existingData.password
        );
        if (!isPasswordValid)
            throw new AppError(
                MESSAGES.ERRORS.AUTH.INVALID_CREDENTIALS,
                "FORBIDDEN"
            );

        const token = await signToken({ id: existingData.id });

        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        await cache.logs.add({
            type: "auth",
            message: "User signed in",
            level: "info",
            actorId: existingData.id,
        });
        return CResponse({ data: safeUserSchema.parse(existingData) });
    } catch (err) {
        return handleError(err);
    }
}
