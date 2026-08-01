import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateStudentEnrollmentSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const body = await req.json();
        const values = updateStudentEnrollmentSchema.parse(body);

        const existing = await queries.student.getEnrollment({ id });
        if (!existing)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const data = await queries.student.updateEnrollment({ id, values });
        await cache.logs.add({
            type: "student",
            message: "Enrollment updated",
            metadata: { id, studentId: existing.studentId },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
