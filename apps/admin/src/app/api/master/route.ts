import { CResponse, handleError, masterQuerySchema } from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const params = masterQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        // sheets create themselves — the Master Table ensures every
        // teacher's month so the snapshot columns are always editable
        await queries.attendance.ensureMonth({ month: params.month });
        const data = await queries.master.paginate(params);

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
