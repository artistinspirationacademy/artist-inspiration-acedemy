import { ABOUT_SECTION_TYPES } from "@workspace/config";
import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const aboutSections = pgTable(
    "about_sections",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        title: t.text("title").notNull(),
        content: t.jsonb("content").notNull().$type(),
        type: t.text("type", { enum: ABOUT_SECTION_TYPES }).notNull(),
        position: t.integer("position").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        index("about_sections_position_idx").on(t.position),
        index("about_sections_type_idx").on(t.type),
        index("about_sections_is_active_idx").on(t.isActive),
    ]
);
