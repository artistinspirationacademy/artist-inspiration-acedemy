import { auth } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateAttendanceMonthSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const isAuth = await auth();
        if (!isAuth)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const { id } = await params;
        const body = await req.json();
        const values = updateAttendanceMonthSchema.parse(body);

        const existing = await queries.attendance.getMonth({ id });
        if (!existing)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const data = await queries.attendance.updateMonth({ id, values });

        await cache.logs.add({
            type: "attendance",
            message: "Attendance row updated by admin",
            actorId: isAuth.user!.id,
            metadata: { id, ...values },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
