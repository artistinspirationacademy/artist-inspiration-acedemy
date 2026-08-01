import { cache } from "@workspace/cache";
import {
    AppError,
    bulkIdsSchema,
    createPackageSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
    updatePackageSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";
import z from "zod";

const packagePaginationQuerySchema = paginationQuerySchema.extend({
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return val === "true";
    }, z.boolean().optional()),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const { page, limit, search, isPaginated, ids, isActive } =
            packagePaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        if (!isPaginated) {
            const data = await queries.package.scan({ ids, isActive });
            return CResponse({ data });
        } else {
            const data = await queries.package.paginate({
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
        const parsed = createPackageSchema.array().parse(body);

        const data = await queries.package.create(parsed);
        await cache.logs.add({
            type: "package",
            message: "Packages created",
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
            .object({ ids: bulkIdsSchema, values: updatePackageSchema })
            .parse(body);

        const existingData = await queries.package.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const data = await queries.package.bulkUpdate({ ids, values });
        await cache.logs.add({
            type: "package",
            message: "Packages bulk updated",
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

        const existingData = await queries.package.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        await queries.package.delete({ ids });
        await cache.logs.add({
            type: "package",
            message: "Packages deleted",
            metadata: { ids, count: ids.length },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
