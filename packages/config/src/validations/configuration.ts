import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";

export const configurationSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    learnerCount: z
        .int("Learner count must be an integer")
        .nonnegative("Learner count cannot be negative"),
    countryCount: z
        .int("Country count must be an integer")
        .nonnegative("Country count cannot be negative"),
    teacherCount: z
        .int("Teacher count must be an integer")
        .nonnegative("Teacher count cannot be negative"),
    contentHoursCount: z
        .int("Content hours count must be an integer")
        .nonnegative("Content hours count cannot be negative"),
    enableBooking: z.boolean(),
    redisLogRetentionDays: z
        .int("Redis log retention days must be an integer")
        .min(1, "Redis log retention must be at least 1 day")
        .max(90, "Redis log retention cannot exceed 90 days"),
    archiveRetentionDays: z
        .int("Archive retention days must be an integer")
        .min(7, "Archive retention must be at least 7 days")
        .max(3650, "Archive retention cannot exceed 10 years"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const updateConfigurationSchema = configurationSchema
    .omit({ id: true, createdAt: true, updatedAt: true })
    .partial();

export type Configuration = z.infer<typeof configurationSchema>;
export type UpdateConfiguration = z.infer<typeof updateConfigurationSchema>;
