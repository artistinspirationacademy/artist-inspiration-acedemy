import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateStudentSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;

        const data = await queries.student.get({ id, include: "enrollments" });
        if (!data)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const body = await req.json();
        const values = updateStudentSchema.parse(body);

        const existing = await queries.student.get({ id });
        if (!existing)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        if (values.code && values.code !== existing.code) {
            const codeOwner = await queries.student.getByCode({
                code: values.code,
            });
            if (codeOwner && codeOwner.id !== id)
                throw new AppError(
                    `Student ID '${values.code}' is already assigned`,
                    "CONFLICT"
                );
        }

        const data = await queries.student.update({ id, values });
        await cache.logs.add({
            type: "student",
            message: "Student updated",
            metadata: { id },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
