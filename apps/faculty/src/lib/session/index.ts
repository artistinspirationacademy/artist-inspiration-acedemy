import { auth } from "@/lib/jwt";
import { AppError, MESSAGES } from "@workspace/config";
import { queries } from "@workspace/db";

/**
 * Resolves the signed-in faculty account and re-reads its teacher binding from
 * the database. Every faculty route scopes its data by the returned teacherId —
 * it is never taken from the request.
 */
export async function requireFaculty() {
    const isAuth = await auth();
    if (!isAuth)
        throw new AppError(
            MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
            "UNAUTHORIZED"
        );

    const account = await queries.faculty.get({ id: isAuth.user.id });
    if (!account || !account.isActive)
        throw new AppError(
            MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
            "UNAUTHORIZED"
        );

    return { account, teacherId: account.teacherId };
}
