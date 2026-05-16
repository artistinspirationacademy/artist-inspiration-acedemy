import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";

export const featureSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    description: z
        .string("Description is required")
        .min(1, "Description cannot be empty"),
    imageKey: z
        .string("Image key is required")
        .min(1, "Image key cannot be empty"),
    position: z
        .int("Position is required")
        .nonnegative("Position must be a non-negative integer"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createFeatureSchema = featureSchema.omit({
    id: true,
    position: true,
    createdAt: true,
    updatedAt: true,
});

export const updateFeatureSchema = createFeatureSchema.partial();

export const reorderFeatureSchema = z
    .array(
        z.object({
            id: generateIdSchema({ isUUID: true }),
            position: z
                .int("Position is required")
                .nonnegative("Position must be a non-negative integer"),
        })
    )
    .min(1, "At least one feature is required");

export type Feature = z.infer<typeof featureSchema>;
export type CreateFeature = z.infer<typeof createFeatureSchema>;
export type UpdateFeature = z.infer<typeof updateFeatureSchema>;
export type ReorderFeature = z.infer<typeof reorderFeatureSchema>;
