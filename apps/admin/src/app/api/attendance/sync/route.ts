import { auth } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import {
    AppError,
    attendanceSheetQuerySchema,
    CResponse,
    generateIdSchema,
    handleError,
    MESSAGES,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

const syncSchema = attendanceSheetQuerySchema.extend({
    teacherId: generateIdSchema({
        isUUID: true,
        error: "Teacher ID must be a valid UUID",
    }),
});

export async function POST(req: NextRequest) {
    try {
        const isAuth = await auth();
        if (!isAuth)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const body = await req.json();
        const { month, teacherId } = syncSchema.parse(body);

        const teacher = await queries.teacher.get({ id: teacherId });
        if (!teacher)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const data = await queries.attendance.ensureMonth({
            teacherId,
            month,
        });

        await cache.logs.add({
            type: "attendance",
            message: "Attendance month synced",
            actorId: isAuth.user!.id,
            metadata: { teacherId, month, added: data.length },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
