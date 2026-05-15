import {
    AppError,
    createTeacherSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";
import z from "zod";

const teacherPaginationQuerySchema = paginationQuerySchema.extend({
    courseId: z.string().uuid().optional(),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
    include: z.enum(["course"]).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const {
            page,
            limit,
            search,
            isPaginated,
            ids,
            courseId,
            isActive,
            include,
        } = teacherPaginationQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        if (!isPaginated) {
            const data =
                include === "course"
                    ? await queries.teacher.scan({
                          ids,
                          courseId,
                          isActive,
                          include: "course",
                      })
                    : await queries.teacher.scan({
                          ids,
                          courseId,
                          isActive,
                      });
            return CResponse({ data });
        } else {
            const data =
                include === "course"
                    ? await queries.teacher.paginate({
                          limit,
                          page,
                          search,
                          courseId,
                          isActive,
                          include: "course",
                      })
                    : await queries.teacher.paginate({
                          limit,
                          page,
                          search,
                          courseId,
                          isActive,
                      });
            return CResponse({ data });
        }
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createTeacherSchema.array().parse(body);

        const data = await queries.teacher.create(parsed);
        await cache.course.drop();
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { ids } = deleteDataSchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        const existingData = await queries.teacher.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.teacher.delete({ ids });
        await cache.course.drop();
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
