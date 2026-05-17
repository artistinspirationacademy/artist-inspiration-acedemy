import z from "zod";
import { NOTIFICATION_STATUSES, NOTIFICATION_TYPES } from "../const";
import { bookingSchema } from "./booking";
import { generateDateSchema, generateIdSchema } from "./general";

export const notificationSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    type: z.enum(NOTIFICATION_TYPES, "Notification type is invalid"),
    status: z.enum(NOTIFICATION_STATUSES, "Notification status is invalid"),
    title: z
        .string("Title is required")
        .min(1, "Title cannot be empty")
        .max(200, "Title is too long"),
    message: z
        .string("Message is required")
        .min(1, "Message cannot be empty")
        .max(1000, "Message is too long"),
    bookingId: z
        .string()
        .uuid("Booking ID must be a valid UUID")
        .nullable()
        .default(null),
    metadata: z.record(z.string(), z.unknown()).nullable().default(null),
    readAt: z
        .union([z.string(), z.date()])
        .transform((v) => new Date(v))
        .nullable()
        .default(null),
    archivedAt: z
        .union([z.string(), z.date()])
        .transform((v) => new Date(v))
        .nullable()
        .default(null),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createNotificationSchema = notificationSchema.omit({
    id: true,
    status: true,
    readAt: true,
    archivedAt: true,
    createdAt: true,
    updatedAt: true,
});

export const updateNotificationSchema = z.object({
    status: z.enum(NOTIFICATION_STATUSES, "Notification status is invalid"),
});

export const fullNotificationSchema = notificationSchema.extend({
    booking: bookingSchema.nullable().default(null),
});

export const notificationPaginationQuerySchema = z.object({
    limit: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return Number(val);
    }, z.int("Limit must be an integer").min(1, "Limit must be at least 1").max(50, "Limit cannot exceed 50").optional().default(10)),
    page: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return Number(val);
    }, z.int("Page must be an integer").min(1, "Page must be at least 1").optional().default(1)),
    status: z.enum(NOTIFICATION_STATUSES).optional(),
    include: z.enum(["booking"]).optional(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type FullNotification = z.infer<typeof fullNotificationSchema>;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
