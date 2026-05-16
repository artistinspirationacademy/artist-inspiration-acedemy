import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    reorderFeatureSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const values = reorderFeatureSchema.parse(body);

        const ids = values.map((item) => item.id);
        const existing = await queries.feature.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existing.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.feature.reorder({ values });
        await cache.home.drop();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
