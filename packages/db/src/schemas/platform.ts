import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const platforms = pgTable(
    "platforms",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        slug: t.text("slug").notNull(),
        position: t.integer("position").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("platforms_slug_uidx").on(t.slug),
        index("platforms_position_idx").on(t.position),
        index("platforms_is_active_idx").on(t.isActive),
    ]
);
