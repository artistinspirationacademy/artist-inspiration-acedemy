import { BANNER_MEDIA_TYPES } from "@workspace/config";
import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const banners = pgTable("banners", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    mediaKey: t.text("media_key").notNull(),
    mediaType: t.text("media_type", { enum: BANNER_MEDIA_TYPES }).notNull(),
    position: t.integer("position").notNull(),
    isActive: t.boolean("is_active").notNull().default(true),
    ...timestamps(t),
}));

export const bannerContent = pgTable("banner_content", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    title: t.text("title").notNull(),
    description: t.text("description").notNull(),
    content: t.text("content").notNull(),
    ...timestamps(t),
}));
