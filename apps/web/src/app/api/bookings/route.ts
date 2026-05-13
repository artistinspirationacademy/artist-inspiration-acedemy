import {
    AppError,
    createBookingSchema,
    CResponse,
    handleError,
    MESSAGES,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createBookingSchema.array().parse(body);

        const courseIds = [...new Set(parsed.map((b) => b.courseId))];
        const emails = [...new Set(parsed.map((b) => b.email))];
        const phones = [...new Set(parsed.map((b) => b.phone))];

        const [courses, existing] = await Promise.all([
            queries.course.scan({ ids: courseIds, isActive: true }),
            queries.booking.scan({ emails, phones }),
        ]);

        const activeCourseIds = new Set(courses.map((c) => c.id));
        if (parsed.some((b) => !activeCourseIds.has(b.courseId)))
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.NOT_FOUND,
                "NOT_FOUND"
            );

        const existingKeys = new Set(
            existing.map((b) => `${b.email}|${b.phone}`)
        );
        if (parsed.some((b) => existingKeys.has(`${b.email}|${b.phone}`)))
            throw new AppError(
                "A booking already exists for this email and phone number",
                "CONFLICT"
            );

        const data = await queries.booking.create(parsed);
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}
