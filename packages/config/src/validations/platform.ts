import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";

export const platformSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z
        .string("Name is required")
        .min(1, "Name cannot be empty")
        .max(100, "Name cannot exceed 100 characters"),
    slug: z
        .string("Slug is required")
        .min(1, "Slug cannot be empty")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
        ),
    position: z
        .int("Position is required")
        .nonnegative("Position must be a non-negative integer"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

// the slug is derived from the name in the query layer, never sent by clients
export const createPlatformSchema = platformSchema.omit({
    id: true,
    slug: true,
    position: true,
    createdAt: true,
    updatedAt: true,
});

export const updatePlatformSchema = createPlatformSchema.partial();

export const reorderPlatformSchema = z
    .array(
        z.object({
            id: generateIdSchema({ isUUID: true }),
            position: z
                .int("Position is required")
                .nonnegative("Position must be a non-negative integer"),
        })
    )
    .min(1, "At least one platform is required");

export type Platform = z.infer<typeof platformSchema>;
export type CreatePlatform = z.infer<typeof createPlatformSchema>;
export type UpdatePlatform = z.infer<typeof updatePlatformSchema>;
export type ReorderPlatform = z.infer<typeof reorderPlatformSchema>;
