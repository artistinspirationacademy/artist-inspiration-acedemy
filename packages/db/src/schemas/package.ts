import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const packages = pgTable(
    "packages",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        slug: t.text("slug").notNull(),
        totalClasses: t.integer("total_classes").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("packages_slug_uidx").on(t.slug),
        index("packages_is_active_idx").on(t.isActive),
    ]
);
