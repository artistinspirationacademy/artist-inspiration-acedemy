import { cache } from "@workspace/cache";
import {
    AppError,
    bulkIdsSchema,
    createPlatformSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
    updatePlatformSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

const platformPaginationQuerySchema = paginationQuerySchema.extend({
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const { page, limit, search, isPaginated, ids, isActive } =
            platformPaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        if (!isPaginated) {
            const data = await queries.platform.scan({ ids, isActive });
            return CResponse({ data });
        } else {
            const data = await queries.platform.paginate({
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
        const parsed = createPlatformSchema.array().parse(body);

        const data = await queries.platform.create(parsed);
        await cache.logs.add({
            type: "platform",
            message: "Platforms created",
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
            .object({ ids: bulkIdsSchema, values: updatePlatformSchema })
            .parse(body);

        const existingData = await queries.platform.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.platform.bulkUpdate({ ids, values });
        await cache.logs.add({
            type: "platform",
            message: "Platforms bulk updated",
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

        const existingData = await queries.platform.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.platform.delete({ ids });
        await cache.logs.add({
            type: "platform",
            message: "Platforms deleted",
            metadata: { ids, count: ids.length },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
