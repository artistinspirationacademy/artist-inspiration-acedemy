import { AUTH_COOKIE_NAME } from "@/config/const";
import { signToken } from "@/lib/jwt";
import { cache, enforceRateLimit, resetRateLimit } from "@workspace/cache";
import {
    AppError,
    CResponse,
    facultySignInSchema,
    handleError,
    MESSAGES,
} from "@workspace/config";
import { queries } from "@workspace/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await enforceRateLimit({
            req,
            scope: "faculty:signin:ip",
            limit: 10,
            windowSec: 60 * 15,
            logType: "auth",
        });

        const body = await req.json();
        const { email, password } = facultySignInSchema.parse(body);

        const emailIdentifier = email.toLowerCase();
        await enforceRateLimit({
            req,
            scope: "faculty:signin:email",
            identifier: emailIdentifier,
            limit: 5,
            windowSec: 60 * 60,
            logType: "auth",
        });

        const existingData = await queries.faculty.get({
            email,
            safeParse: false,
        });
        if (!existingData || !existingData.password || !existingData.isActive)
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

        const teacher = await queries.teacher.get({
            id: existingData.teacherId,
        });
        if (!teacher)
            throw new AppError(
                MESSAGES.ERRORS.AUTH.INVALID_CREDENTIALS,
                "UNAUTHORIZED"
            );

        await resetRateLimit({
            scope: "faculty:signin:email",
            identifier: emailIdentifier,
        });

        const token = await signToken({
            id: existingData.id,
            teacherId: existingData.teacherId,
        });

        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        await queries.faculty.markLogin({ id: existingData.id });
        await cache.logs.add({
            type: "auth",
            message: "Faculty signed in",
            actorId: existingData.id,
            metadata: { teacherId: existingData.teacherId },
        });

        const account = await queries.faculty.get({ id: existingData.id });
        return CResponse({ data: { ...account!, teacher } });
    } catch (err) {
        return handleError(err);
    }
}
