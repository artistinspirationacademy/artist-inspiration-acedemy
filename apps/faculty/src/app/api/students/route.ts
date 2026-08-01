import { requireFaculty } from "@/lib/session";
import {
    CResponse,
    FullStudent,
    handleError,
    paginationQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

/**
 * A teacher has no business seeing who else a student studies with — and the
 * academy fee never leaves the admin panel, so it is removed from the shape
 * entirely rather than nulled.
 */
const ownEnrollmentsOnly = (teacherId: string) => (student: FullStudent) => ({
    ...student,
    enrollments: student.enrollments
        .filter((enrollment) => enrollment.teacherId === teacherId)
        .map((enrollment) => {
            const { academyFee, ...rest } = enrollment;
            void academyFee;
            return rest;
        }),
});

const studentPaginationQuerySchema = paginationQuerySchema.extend({
    courseId: z.string().uuid().optional(),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
    include: z.enum(["enrollments"]).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { teacherId } = await requireFaculty();

        const { searchParams } = new URL(req.url);
        const { page, limit, search, isPaginated, courseId, isActive } =
            studentPaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        if (!isPaginated) {
            const data = await queries.student.scan({
                teacherId,
                courseId,
                isActive,
                include: "enrollments",
            });
            return CResponse({ data: data.map(ownEnrollmentsOnly(teacherId)) });
        }

        const data = await queries.student.paginate({
            limit,
            page,
            search,
            teacherId,
            courseId,
            isActive,
            include: "enrollments",
        });
        return CResponse({
            data: {
                ...data,
                data: data.data.map(ownEnrollmentsOnly(teacherId)),
            },
        });
    } catch (err) {
        return handleError(err);
    }
}
