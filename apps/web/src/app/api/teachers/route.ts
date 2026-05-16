import { cache } from "@workspace/cache";
import { CResponse, handleError } from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId") ?? undefined;

        if (courseId) {
            const data = await cache.teacher.byCourse(courseId);
            return CResponse({ data });
        }

        const data = await queries.teacher.scan({
            isActive: true,
            include: "courses",
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
