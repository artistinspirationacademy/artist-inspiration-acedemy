import { createFacultyAccount, setFacultyPassword } from "@/lib/faculty";
import { cache } from "@workspace/cache";
import {
    AppError,
    createFacultyAccountSchema,
    CResponse,
    handleError,
    MESSAGES,
    updateFacultyAccountSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { email, password } = createFacultyAccountSchema.parse(body);

        const teacher = await queries.teacher.get({ id });
        if (!teacher)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const { account, loginUrl } = await createFacultyAccount({
            teacherId: teacher.id,
            teacherName: teacher.name,
            email,
            password,
        });

        await cache.logs.add({
            type: "faculty",
            message: "Faculty account created",
            metadata: { teacherId: teacher.id, email },
        });
        return CResponse({
            message: "CREATED",
            data: { ...account, loginUrl },
        });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { password, ...values } = updateFacultyAccountSchema.parse(body);

        const teacher = await queries.teacher.get({ id });
        if (!teacher)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const existing = await queries.faculty.get({ teacherId: id });
        if (!existing)
            throw new AppError(
                "This teacher does not have a faculty account",
                "NOT_FOUND"
            );

        if (values.email && values.email !== existing.email) {
            const emailOwner = await queries.faculty.get({
                email: values.email,
            });
            if (emailOwner && emailOwner.id !== existing.id)
                throw new AppError(
                    "Another faculty account already uses this email",
                    "CONFLICT"
                );
        }

        let data =
            Object.keys(values).length > 0
                ? await queries.faculty.update({ id: existing.id, values })
                : existing;

        let loginUrl: string | null = null;
        if (password) {
            const result = await setFacultyPassword({
                facultyUserId: existing.id,
                teacherName: teacher.name,
                email: values.email ?? existing.email,
                password,
            });
            data = result.account;
            loginUrl = result.loginUrl;
        }

        // the password value itself must never reach the logs
        await cache.logs.add({
            type: "faculty",
            message: password
                ? "Faculty account password set by admin"
                : "Faculty account updated",
            metadata: { teacherId: id, ...values },
        });
        return CResponse({ data: { ...data, loginUrl } });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;

        const existing = await queries.faculty.get({ teacherId: id });
        if (!existing)
            throw new AppError(
                "This teacher does not have a faculty account",
                "NOT_FOUND"
            );

        await queries.faculty.delete({ id: existing.id });

        await cache.logs.add({
            type: "faculty",
            level: "warn",
            message: "Faculty account revoked",
            metadata: { teacherId: id, email: existing.email },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
