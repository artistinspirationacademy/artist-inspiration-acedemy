import { cache } from "@workspace/cache";
import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    reorderTeacherSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const values = reorderTeacherSchema.parse(body);

        const ids = values.map((item) => item.id);
        const existing = await queries.teacher.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existing.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.teacher.reorder({ values });
        await cache.teacher.drop();
        await cache.logs.add({
            type: "teacher",
            message: "Teachers reordered",
            metadata: { count: values.length },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
