import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";

export const packageSchema = z.object({
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
    totalClasses: z
        .int("Total classes is required")
        .positive("Total classes must be greater than 0")
        .max(1000, "Total classes cannot exceed 1000"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

// the slug is derived from the name in the query layer, never sent by clients
export const createPackageSchema = packageSchema.omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
});

export const updatePackageSchema = createPackageSchema.partial();

export type Package = z.infer<typeof packageSchema>;
export type CreatePackage = z.infer<typeof createPackageSchema>;
export type UpdatePackage = z.infer<typeof updatePackageSchema>;
