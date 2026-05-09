import { BANNER_MEDIA_TYPES } from "@workspace/config";
import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const banners = pgTable(
    "banners",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        mediaKey: t.text("media_key").notNull(),
        mediaType: t.text("media_type", { enum: BANNER_MEDIA_TYPES }).notNull(),
        position: t.integer("position").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        index("banners_position_idx").on(t.position),
        index("banners_is_active_idx").on(t.isActive),
        index("banners_media_type_idx").on(t.mediaType),
    ]
);

export const bannerContent = pgTable("banner_content", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    title: t.text("title").notNull(),
    description: t.text("description").notNull(),
    content: t.text("content").notNull(),
    ...timestamps(t),
}));
