import { cache } from "@workspace/cache";
import {
    AppError,
    bulkIdsSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    NOTIFICATION_STATUSES,
    notificationPaginationQuerySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { page, limit, status, include } =
            notificationPaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        const data =
            include === "booking"
                ? await queries.notification.paginate({
                      limit,
                      page,
                      status,
                      include: "booking",
                  })
                : await queries.notification.paginate({
                      limit,
                      page,
                      status,
                  });

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

const patchBodySchema = z
    .object({
        ids: bulkIdsSchema.optional(),
        status: z.enum(NOTIFICATION_STATUSES),
        scopeStatus: z.enum(NOTIFICATION_STATUSES).optional(),
    })
    .refine((v) => !!v.ids?.length || !!v.scopeStatus, {
        message: "Provide either `ids` or `scopeStatus`",
    });

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, status, scopeStatus } = patchBodySchema.parse(body);

        if (ids?.length) {
            const existing = await queries.notification.scan({ ids });
            const invalidIds = ids.filter(
                (id) => !existing.find((item) => item.id === id)
            );
            if (invalidIds.length)
                throw new AppError(
                    MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                    "BAD_REQUEST"
                );
        }

        const data = await queries.notification.bulkUpdate({
            ids,
            status,
            scopeStatus,
        });
        await cache.notification.drop();

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

        const existing = await queries.notification.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existing.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.notification.delete({ ids });
        await cache.notification.drop();

        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
