import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";
import { BANNER_MEDIA_TYPES } from "../const";

export const bannerSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    mediaKey: z
        .string("Media key is required")
        .min(1, "Media key cannot be empty"),
    mediaType: z.enum(BANNER_MEDIA_TYPES, {
        error:
            "Media type is required and must be one of: " +
            BANNER_MEDIA_TYPES.join(", "),
    }),
    position: z
        .int("Position is required")
        .nonnegative("Position must be a non-negative integer"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createBannerSchema = bannerSchema.omit({
    id: true,
    position: true,
    createdAt: true,
    updatedAt: true,
});

export const updateBannerSchema = createBannerSchema.partial();

export const reorderBannerSchema = z
    .array(
        z.object({
            id: generateIdSchema({ isUUID: true }),
            position: z
                .int("Position is required")
                .nonnegative("Position must be a non-negative integer"),
        })
    )
    .min(1, "At least one banner is required");

export type Banner = z.infer<typeof bannerSchema>;
export type CreateBanner = z.infer<typeof createBannerSchema>;
export type UpdateBanner = z.infer<typeof updateBannerSchema>;
export type ReorderBanner = z.infer<typeof reorderBannerSchema>;
