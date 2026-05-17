import { cache, enforceRateLimit } from "@workspace/cache";
import {
    AppError,
    createBookingSchema,
    CResponse,
    handleError,
    MESSAGES,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { sendBookingEmails } from "@workspace/email";
import { NextRequest } from "next/server";
import z from "zod";
import { env } from "@/env";

const MAX_BOOKINGS_PER_REQUEST = 5;

const bookingsPayloadSchema = z
    .array(createBookingSchema)
    .min(1, "At least one booking is required")
    .max(
        MAX_BOOKINGS_PER_REQUEST,
        `No more than ${MAX_BOOKINGS_PER_REQUEST} bookings per request`
    );

export async function POST(req: NextRequest) {
    try {
        await enforceRateLimit({
            req,
            scope: "booking:create",
            limit: 5,
            windowSec: 60 * 15,
            logType: "booking",
        });

        const body = await req.json();
        const parsed = bookingsPayloadSchema.parse(body);

        const home = await cache.home.get();
        if (home.configuration && !home.configuration.enableBooking)
            throw new AppError(
                "Bookings are currently disabled. Please check back later.",
                "FORBIDDEN"
            );

        const courseIds = [...new Set(parsed.map((b) => b.courseId))];
        const emails = [...new Set(parsed.map((b) => b.email))];
        const phones = [...new Set(parsed.map((b) => b.phone))];

        const [courses, existing] = await Promise.all([
            queries.course.scan({ ids: courseIds, isActive: true }),
            queries.booking.scan({ emails, phones }),
        ]);

        const activeCourseIds = new Set(courses.map((c) => c.id));
        if (parsed.some((b) => !activeCourseIds.has(b.courseId)))
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        const existingKeys = new Set(
            existing.map((b) => `${b.email}|${b.phone}`)
        );
        if (parsed.some((b) => existingKeys.has(`${b.email}|${b.phone}`)))
            throw new AppError(
                "A booking already exists for this email and phone number",
                "CONFLICT"
            );

        const data = await queries.booking.create(parsed);

        const teacherIds = [
            ...new Set(
                data
                    .map((b) => b.teacherId)
                    .filter((id): id is string => !!id)
            ),
        ];
        const teachers = teacherIds.length
            ? await queries.teacher.scan({ ids: teacherIds })
            : [];
        const teacherNameById = new Map(teachers.map((t) => [t.id, t.name]));

        const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
        await queries.notification.create(
            data.map((booking) => ({
                type: "booking_created" as const,
                title: "New booking received",
                message: `${booking.name} booked ${
                    courseTitleById.get(booking.courseId) ?? "a course"
                }`,
                bookingId: booking.id,
                metadata: {
                    bookingId: booking.id,
                    name: booking.name,
                    email: booking.email,
                    phone: booking.phone,
                    courseId: booking.courseId,
                    courseTitle:
                        courseTitleById.get(booking.courseId) ?? null,
                },
            }))
        );
        await cache.notification.drop();

        for (const booking of data) {
            await cache.logs.add({
                type: "booking",
                message: "New public booking received",
                metadata: {
                    id: booking.id,
                    name: booking.name,
                    courseId: booking.courseId,
                },
            });
        }

        await sendBookingEmails(
            data.map((booking) => ({
                booking,
                courseTitle:
                    courseTitleById.get(booking.courseId) ?? "your course",
                teacherName: booking.teacherId
                    ? (teacherNameById.get(booking.teacherId) ?? null)
                    : null,
                adminEmail: env.ADMIN_EMAIL,
                from: env.EMAIL_FROM,
                siteUrl:
                    process.env.NEXT_PUBLIC_DEPLOYMENT_URL
                        ? `https://${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}`
                        : "https://artistinspiration.academy",
                adminUrl: env.ADMIN_URL,
            }))
        );

        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}
