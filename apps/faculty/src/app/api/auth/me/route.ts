import { requireFaculty } from "@/lib/session";
import { AppError, CResponse, handleError, MESSAGES } from "@workspace/config";
import { queries } from "@workspace/db";

export async function GET() {
    try {
        const { account } = await requireFaculty();

        const teacher = await queries.teacher.get({ id: account.teacherId });
        if (!teacher)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        return CResponse({ data: { ...account, teacher } });
    } catch (err) {
        return handleError(err);
    }
}
