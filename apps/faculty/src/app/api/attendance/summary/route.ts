import { requireFaculty } from "@/lib/session";
import {
    attendanceSheetQuerySchema,
    CResponse,
    handleError,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { teacherId } = await requireFaculty();

        const { searchParams } = new URL(req.url);
        const { month } = attendanceSheetQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        await queries.attendance.ensureMonth({ teacherId, month });
        // the faculty audience never receives the academy fee (B2 invariant)
        const data = await queries.attendance.summary({
            teacherId,
            month,
            audience: "faculty",
        });

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
