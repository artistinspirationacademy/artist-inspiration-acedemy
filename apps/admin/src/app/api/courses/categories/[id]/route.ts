import {
    AppError,
    CResponse,
    handleError,
    MESSAGES,
    updateCourseCategorySchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { cache } from "@workspace/cache";
import { NextRequest } from "next/server";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Context) {
    try {
        const { id } = await params;

        const data = await queries.course.category.get({ id });
        if (!data)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const body = await req.json();
        const values = updateCourseCategorySchema.parse(body);

        const existing = await queries.course.category.get({ id });
        if (!existing)
            throw new AppError(MESSAGES.ERRORS.GENERAL.NOT_FOUND, "NOT_FOUND");

        if (values.slug) {
            const slugConflict = await queries.course.category.get({
                slug: values.slug,
            });
            if (slugConflict && slugConflict.id !== id)
                throw new AppError(
                    `A category with slug '${values.slug}' already exists`,
                    "CONFLICT"
                );
        }

        const data = await queries.course.category.update({ id, values });
        await cache.course.drop();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
