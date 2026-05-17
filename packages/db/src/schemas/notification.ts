import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const notifications = pgTable(
    "notifications",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        type: t.text("type").notNull(),
        status: t.text("status").notNull().default("unread"),
        title: t.text("title").notNull(),
        message: t.text("message").notNull(),
        bookingId: t.uuid("booking_id"),
        metadata: t.jsonb("metadata"),
        readAt: t.timestamp("read_at"),
        archivedAt: t.timestamp("archived_at"),
        ...timestamps(t),
    }),
    (t) => [
        index("notifications_status_idx").on(t.status),
        index("notifications_type_idx").on(t.type),
        index("notifications_booking_id_idx").on(t.bookingId),
        index("notifications_created_at_idx").on(t.createdAt),
    ]
);
