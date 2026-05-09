import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const courseCategories = pgTable("course_categories", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    slug: t.text("slug").notNull().unique(),
    isActive: t.boolean("is_active").notNull().default(true),
    ...timestamps(t),
}));

export const courses = pgTable("courses", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    courseCategoryId: t
        .uuid("course_category_id")
        .notNull()
        .references(() => courseCategories.id),
    title: t.text("title").notNull(),
    description: t.text("description").notNull(),
    about: t.jsonb("about").notNull().default([]),
    imageKey: t.text("image_key").notNull(),
    isActive: t.boolean("is_active").notNull().default(true),
    ...timestamps(t),
}));
