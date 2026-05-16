import {
    AppError,
    bulkIdsSchema,
    createTestimonialSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
    updateTestimonialSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";
import z from "zod";

const testimonialPaginationQuerySchema = paginationQuerySchema.extend({
    courseId: z.string().optional(),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const { page, limit, search, isPaginated, ids, courseId, isActive } =
            testimonialPaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        if (!isPaginated) {
            const data = await queries.testimonial.scan({
                ids,
                courseId,
                isActive,
            });
            return CResponse({ data });
        } else {
            const data = await queries.testimonial.paginate({
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
        const parsed = createTestimonialSchema.array().parse(body);

        const data = await queries.testimonial.create(parsed);
        await cache.home.drop();
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, values } = z
            .object({ ids: bulkIdsSchema, values: updateTestimonialSchema })
            .parse(body);

        const existingData = await queries.testimonial.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.testimonial.bulkUpdate({ ids, values });
        await cache.home.drop();
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

        const existingData = await queries.testimonial.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.testimonial.delete({ ids });
        await cache.home.drop();
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
