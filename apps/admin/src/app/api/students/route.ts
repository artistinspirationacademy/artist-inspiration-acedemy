import { cache } from "@workspace/cache";
import {
    AppError,
    bulkIdsSchema,
    bulkUpdateStudentSchema,
    createStudentSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

const studentPaginationQuerySchema = paginationQuerySchema.extend({
    teacherId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
    include: z.enum(["enrollments"]).optional(),
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
            teacherId,
            courseId,
            isActive,
            include,
        } = studentPaginationQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        if (!isPaginated) {
            const data =
                include === "enrollments"
                    ? await queries.student.scan({
                          ids,
                          teacherId,
                          courseId,
                          isActive,
                          include: "enrollments",
                      })
                    : await queries.student.scan({
                          ids,
                          teacherId,
                          courseId,
                          isActive,
                      });
            return CResponse({ data });
        } else {
            const data =
                include === "enrollments"
                    ? await queries.student.paginate({
                          limit,
                          page,
                          search,
                          teacherId,
                          courseId,
                          isActive,
                          include: "enrollments",
                      })
                    : await queries.student.paginate({
                          limit,
                          page,
                          search,
                          teacherId,
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
        const parsed = createStudentSchema.array().parse(body);

        for (const values of parsed) {
            if (!values.code) continue;

            const codeOwner = await queries.student.getByCode({
                code: values.code,
            });
            if (codeOwner)
                throw new AppError(
                    `Student ID '${values.code}' is already assigned`,
                    "CONFLICT"
                );
        }

        const data = await queries.student.create(parsed);
        await cache.logs.add({
            type: "student",
            message: "Students created",
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
            .object({ ids: bulkIdsSchema, values: bulkUpdateStudentSchema })
            .parse(body);

        const existingData = await queries.student.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.student.bulkUpdate({ ids, values });
        await cache.logs.add({
            type: "student",
            message: "Students bulk updated",
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

        const existingData = await queries.student.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.student.delete({ ids });
        await cache.logs.add({
            type: "student",
            level: "warn",
            message: "Students deleted",
            metadata: { ids, count: ids.length },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
