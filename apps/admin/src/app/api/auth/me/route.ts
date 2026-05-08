import { auth } from "@/lib/jwt";
import { AppError, CResponse, handleError, MESSAGES } from "@workspace/config";
import { queries } from "@workspace/db";

export async function GET() {
    try {
        const isAuth = await auth();
        if (!isAuth)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const existingData = await queries.user.get({ id: isAuth.user!.id });
        if (!existingData)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        return CResponse({ data: existingData });
    } catch (err) {
        return handleError(err);
    }
}
