import {
    AppError,
    bulkIdsSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
    updateBookingSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

const bookingPaginationQuerySchema = paginationQuerySchema.extend({
    courseId: z.uuid().optional(),
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
        } = bookingPaginationQuerySchema.parse(
            Object.fromEntries(searchParams.entries())
        );

        if (!isPaginated) {
            const data =
                include === "course"
                    ? await queries.booking.scan({
                          ids,
                          courseId,
                          isActive,
                          include: "course",
                      })
                    : await queries.booking.scan({
                          ids,
                          courseId,
                          isActive,
                      });
            return CResponse({ data });
        } else {
            const data =
                include === "course"
                    ? await queries.booking.paginate({
                          limit,
                          page,
                          search,
                          courseId,
                          isActive,
                          include: "course",
                      })
                    : await queries.booking.paginate({
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
            .object({ ids: bulkIdsSchema, values: updateBookingSchema })
            .parse(body);

        const existingData = await queries.booking.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.booking.bulkUpdate({ ids, values });
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

        const existingData = await queries.booking.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.booking.delete({ ids });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
