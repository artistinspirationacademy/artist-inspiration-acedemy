import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const features = pgTable("features", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    description: t.text("description").notNull(),
    imageKey: t.text("image_key").notNull(),
    isActive: t.boolean("is_active").notNull().default(true),
    ...timestamps(t),
}));
