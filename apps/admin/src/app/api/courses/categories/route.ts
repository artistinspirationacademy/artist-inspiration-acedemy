import {
    AppError,
    createCourseCategorySchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

const categoryPaginationQuerySchema = paginationQuerySchema.extend({
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
    include: z.enum(["courses"]).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const { page, limit, search, isPaginated, ids, isActive, include } =
            categoryPaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        if (!isPaginated) {
            const data =
                include === "courses"
                    ? await queries.course.category.scan({
                          ids,
                          isActive,
                          include: "courses",
                      })
                    : await queries.course.category.scan({ ids, isActive });
            return CResponse({ data });
        } else {
            const data = await queries.course.category.paginate({
                limit,
                page,
                search,
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
        const parsed = createCourseCategorySchema.array().parse(body);

        const slugs = parsed.map((item) => item.slug);
        const conflicting = await queries.course.category.scan({ slugs });
        if (conflicting.length)
            throw new AppError(
                `Categories with the following slugs already exist: ${conflicting.map((c) => `'${c.slug}'`).join(", ")}`,
                "CONFLICT"
            );

        const data = await queries.course.category.create(parsed);
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

        const existingData = await queries.course.category.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.course.category.delete({ ids });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
