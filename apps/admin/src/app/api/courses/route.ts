import {
    AppError,
    bulkIdsSchema,
    bulkUpdateCourseSchema,
    createCourseSchema,
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

const coursePaginationQuerySchema = paginationQuerySchema.extend({
    courseCategoryId: z.string().uuid().optional(),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
    include: z.enum(["details"]).optional(),
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
            courseCategoryId,
            isActive,
            include,
        } = coursePaginationQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        if (!isPaginated) {
            const data =
                include === "details"
                    ? await queries.course.scan({
                          ids,
                          courseCategoryId,
                          isActive,
                          include: "details",
                      })
                    : await queries.course.scan({
                          ids,
                          courseCategoryId,
                          isActive,
                      });
            return CResponse({ data });
        } else {
            const data =
                include === "details"
                    ? await queries.course.paginate({
                          limit,
                          page,
                          search,
                          courseCategoryId,
                          isActive,
                          include: "details",
                      })
                    : await queries.course.paginate({
                          limit,
                          page,
                          search,
                          courseCategoryId,
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
        const parsed = createCourseSchema.array().parse(body);

        const data = await queries.course.create(parsed);
        await cache.course.drop();
        await cache.logs.add({
            type: "course",
            message: "Courses created",
            metadata: { count: data.length },
        });
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, values } = z
            .object({ ids: bulkIdsSchema, values: bulkUpdateCourseSchema })
            .parse(body);

        const existingData = await queries.course.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.course.bulkUpdate({ ids, values });
        await cache.course.drop();
        await cache.logs.add({
            type: "course",
            message: "Courses bulk updated",
            metadata: { ids, count: ids.length },
        });
        return CResponse({ data });
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

        const existingData = await queries.course.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.course.delete({ ids });
        await cache.course.drop();
        await cache.logs.add({
            type: "course",
            message: "Courses deleted",
            metadata: { ids, count: ids.length },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
