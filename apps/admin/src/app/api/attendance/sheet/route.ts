import {
    attendanceSheetQuerySchema,
    CResponse,
    generateIdSchema,
    handleError,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

const adminSheetQuerySchema = attendanceSheetQuerySchema.extend({
    teacherId: generateIdSchema({
        isUUID: true,
        error: "Teacher ID must be a valid UUID",
    }),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { month, teacherId, page, limit } = adminSheetQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        await queries.attendance.ensureMonth({ teacherId, month });
        const data = await queries.attendance.sheet({
            teacherId,
            month,
            page,
            limit,
        });

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
