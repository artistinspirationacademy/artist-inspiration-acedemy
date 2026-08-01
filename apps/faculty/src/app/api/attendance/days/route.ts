import { requireFaculty } from "@/lib/session";
import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    markAttendanceSchema,
    monthKeyOf,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { account, teacherId } = await requireFaculty();

        const body = await req.json();
        const values = markAttendanceSchema.parse(body);

        const monthIds = [
            ...new Set(values.map((value) => value.attendanceMonthId)),
        ];
        const months = await queries.attendance.scanMonths({ ids: monthIds });

        for (const id of monthIds) {
            const month = months.find((row) => row.id === id);
            if (!month || month.teacherId !== teacherId)
                throw new AppError(
                    "You can only edit your own attendance sheet",
                    "FORBIDDEN"
                );

            if (month.isLocked)
                throw new AppError(
                    "This month is locked. Ask the academy team to unlock it.",
                    "FORBIDDEN"
                );
        }

        const invalidDates = values.filter((value) => {
            const month = months.find(
                (row) => row.id === value.attendanceMonthId
            );
            return monthKeyOf(value.date) !== monthKeyOf(month!.month);
        });
        if (invalidDates.length)
            throw new AppError(
                "A date falls outside the month it belongs to",
                "BAD_REQUEST"
            );

        const data = await queries.attendance.markDays({
            values,
            role: "faculty",
            editorId: account.id,
        });

        await cache.logs.add({
            type: "attendance",
            message: "Attendance marked by faculty",
            actorId: account.id,
            metadata: { teacherId, count: values.length },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
