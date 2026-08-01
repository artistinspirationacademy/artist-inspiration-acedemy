import { auth } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    markAttendanceSchema,
    MESSAGES,
    monthKeyOf,
} from "@workspace/config";
import { queries } from "@workspace/db";
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
        const values = markAttendanceSchema.parse(body);

        const monthIds = [
            ...new Set(values.map((value) => value.attendanceMonthId)),
        ];
        const months = await queries.attendance.scanMonths({ ids: monthIds });

        const invalidIds = monthIds.filter(
            (id) => !months.find((row) => row.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

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
            role: "admin",
            editorId: isAuth.user!.id,
        });

        await cache.logs.add({
            type: "attendance",
            message: "Attendance marked by admin",
            actorId: isAuth.user!.id,
            metadata: { count: values.length },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
