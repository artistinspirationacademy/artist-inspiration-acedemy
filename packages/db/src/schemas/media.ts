import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const media = pgTable("media", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    alt: t.text("alt"),
    key: t.text("key").notNull(),
    type: t.text("type").notNull(),
    size: t.integer("size").notNull(),
    ...timestamps(t),
}));
