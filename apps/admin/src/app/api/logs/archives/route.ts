import {
    CResponse,
    handleError,
    paginationQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { page, limit } = paginationQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        const data = await queries.logArchive.paginate({ page, limit });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
