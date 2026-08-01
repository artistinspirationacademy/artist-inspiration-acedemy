import { env } from "@/env";
import { AppError } from "@workspace/config";
import { queries } from "@workspace/db";
import { sendFacultyCredentialsEmail } from "@workspace/email";
import bcrypt from "bcryptjs";

/**
 * Creates an account that is active immediately — the admin chose the
 * password, so there is no invite step. The plaintext password only exists
 * here long enough to hash it and hand it to the credentials email; it is
 * never persisted or logged.
 */
export async function createFacultyAccount({
    teacherId,
    teacherName,
    email,
    password,
}: {
    teacherId: string;
    teacherName: string;
    email: string;
    password: string;
}) {
    const existingAccount = await queries.faculty.get({ teacherId });
    if (existingAccount)
        throw new AppError(
            "This teacher already has a faculty account",
            "CONFLICT"
        );

    const emailOwner = await queries.faculty.get({ email });
    if (emailOwner)
        throw new AppError(
            "Another faculty account already uses this email",
            "CONFLICT"
        );

    const account = await queries.faculty.create({
        teacherId,
        email,
        passwordHash: await bcrypt.hash(password, 10),
    });

    const { loginUrl, delivered } = await sendFacultyCredentialsEmail({
        teacherName,
        email: account.email,
        password,
        facultyUrl: env.FACULTY_URL,
        from: env.EMAIL_FROM,
    });

    return { account, loginUrl: delivered ? null : loginUrl };
}

/**
 * The "teacher asked personally" path: overwrite the hash and re-send the
 * credentials so the teacher has a mailed copy of the new password.
 */
export async function setFacultyPassword({
    facultyUserId,
    teacherName,
    email,
    password,
}: {
    facultyUserId: string;
    teacherName: string;
    email: string;
    password: string;
}) {
    const account = await queries.faculty.updatePassword({
        id: facultyUserId,
        passwordHash: await bcrypt.hash(password, 10),
    });
    if (!account)
        throw new AppError(
            "This faculty account no longer exists",
            "NOT_FOUND"
        );

    const { loginUrl, delivered } = await sendFacultyCredentialsEmail({
        teacherName,
        email,
        password,
        facultyUrl: env.FACULTY_URL,
        from: env.EMAIL_FROM,
    });

    return { account, loginUrl: delivered ? null : loginUrl };
}
