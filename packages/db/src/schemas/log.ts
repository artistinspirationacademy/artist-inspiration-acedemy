import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const logArchives = pgTable(
    "log_archives",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        periodStart: t.timestamp("period_start").notNull(),
        periodEnd: t.timestamp("period_end").notNull(),
        entryCount: t.integer("entry_count").notNull().default(0),
        fileSize: t.integer("file_size").notNull().default(0),
        fileKey: t.text("file_key").notNull(),
        fileUrl: t.text("file_url").notNull(),
        ...timestamps(t),
    }),
    (t) => [
        index("log_archives_period_start_idx").on(t.periodStart),
        index("log_archives_created_at_idx").on(t.createdAt),
    ]
);
