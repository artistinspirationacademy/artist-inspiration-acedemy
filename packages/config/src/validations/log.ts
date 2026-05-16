import z from "zod";
import { LOG_LEVELS, LOG_TYPES } from "../const";
import { generateDateSchema, generateIdSchema } from "./general";

export const logEntrySchema = z.object({
    id: z.string().min(1),
    type: z.enum(LOG_TYPES),
    level: z.enum(LOG_LEVELS).default("info"),
    message: z.string().min(1),
    actorId: z.string().nullable().default(null),
    metadata: z.record(z.string(), z.unknown()).nullable().default(null),
    createdAt: z.string(),
});

export const createLogSchema = z.object({
    type: z.enum(LOG_TYPES),
    level: z.enum(LOG_LEVELS).default("info"),
    message: z.string().min(1, "Log message cannot be empty"),
    actorId: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const logArchiveSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string().min(1),
    periodStart: generateDateSchema({ error: "periodStart must be a valid date" }),
    periodEnd: generateDateSchema({ error: "periodEnd must be a valid date" }),
    entryCount: z.int().nonnegative(),
    fileSize: z.int().nonnegative(),
    fileKey: z.string().min(1),
    fileUrl: z.string().url(),
    createdAt: generateDateSchema({ error: "createdAt must be a valid date" }),
    updatedAt: generateDateSchema({ error: "updatedAt must be a valid date" }),
});

export const recentLogsQuerySchema = z.object({
    type: z.enum(LOG_TYPES).optional(),
    limit: z.coerce.number().int().positive().max(500).default(100),
});

export type LogEntry = z.infer<typeof logEntrySchema>;
export type CreateLog = z.input<typeof createLogSchema>;
export type LogArchive = z.infer<typeof logArchiveSchema>;
export type LogType = (typeof LOG_TYPES)[number];
export type LogLevel = (typeof LOG_LEVELS)[number];
