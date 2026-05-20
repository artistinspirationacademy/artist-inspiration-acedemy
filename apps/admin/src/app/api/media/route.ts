import { utApi } from "@/lib/uploadthing";
import { cache } from "@workspace/cache";
import {
    AppError,
    createMediaSchema,
    CResponse,
    deleteDataSchema,
    handleError,
    MESSAGES,
    paginationQuerySchema,
    uploadMediaPayloadSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

const mediaPaginationQuerySchema = paginationQuerySchema.extend({
    types: createMediaSchema.shape.type
        .transform((val) => val.split(",").filter(Boolean))
        .optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const { page, limit, search, isPaginated, ids, types } =
            mediaPaginationQuerySchema.parse(
                Object.fromEntries(searchParams.entries())
            );

        if (!isPaginated) {
            const data = await queries.media.scan({ ids, types });
            return CResponse({ data });
        } else {
            const data = await queries.media.paginate({
                limit,
                page,
                search,
                types,
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
        const { files } = uploadMediaPayloadSchema.parse(body);

        if (files.length === 0)
            throw new AppError(
                MESSAGES.ERRORS.MEDIA.NO_VALID_FILES,
                "BAD_REQUEST"
            );

        const mediaToCreate = files.map((file) => ({
            name: file.name,
            alt: null,
            key: file.key,
            type: file.type,
            size: file.size,
        }));

        const parsed = createMediaSchema.array().parse(mediaToCreate);
        const data = await queries.media.create(parsed);
        await cache.logs.add({
            type: "media",
            message: "Media uploaded",
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

        const existingData = await queries.media.scan({ ids });
        const invalidIds = ids.filter(
            (id) => !existingData.find((item) => item.id === id)
        );
        if (invalidIds.length)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.INVALID_IDS(invalidIds),
                "BAD_REQUEST"
            );

        const filesToDelete = existingData.map((media) => media.key);
        if (filesToDelete.length > 0) {
            try {
                await utApi.deleteFiles(filesToDelete);
            } catch (error) {
                console.error(
                    "Failed to delete files from UploadThing:",
                    error
                );
            }
        }

        await queries.media.delete({ ids });
        await cache.logs.add({
            type: "media",
            message: "Media deleted",
            metadata: { ids, count: ids.length },
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
