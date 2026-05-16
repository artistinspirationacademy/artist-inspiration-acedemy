import { cache } from "@workspace/cache";
import {
    AppError,
    bulkIdsSchema,
    createTeacherSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
    updateTeacherSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

const teacherPaginationQuerySchema = paginationQuerySchema.extend({
    courseId: z.string().uuid().optional(),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
    include: z.enum(["courses"]).optional(),
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
                include === "courses"
                    ? await queries.teacher.scan({
                          ids,
                          courseId,
                          isActive,
                          include: "courses",
                      })
                    : await queries.teacher.scan({
                          ids,
                          courseId,
                          isActive,
                      });
            return CResponse({ data });
        } else {
            const data =
                include === "courses"
                    ? await queries.teacher.paginate({
                          limit,
                          page,
                          search,
                          courseId,
                          isActive,
                          include: "courses",
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

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, values } = z
            .object({ ids: bulkIdsSchema, values: updateTeacherSchema })
            .parse(body);

        const existingData = await queries.teacher.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.teacher.bulkUpdate({ ids, values });
        await cache.teacher.drop();
        await cache.logs.add({
            type: "teacher",
            message: "Teachers bulk updated",
            metadata: { ids, count: ids.length },
        });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createTeacherSchema.array().parse(body);

        const data = await queries.teacher.create(parsed);
        await cache.teacher.drop();
        await cache.logs.add({
            type: "teacher",
            message: "Teachers created",
            metadata: { count: data.length },
        });
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
        await cache.teacher.drop();
        await cache.logs.add({
            type: "teacher",
            message: "Teachers deleted",
            metadata: { ids, count: ids.length },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
