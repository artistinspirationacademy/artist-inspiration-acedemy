import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { courses } from "./course";

export const testimonials = pgTable("testimonials", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    feedback: t.text("feedback").notNull(),
    courseId: t
        .uuid("course_id")
        .notNull()
        .references(() => courses.id),
    rating: t.integer("rating").notNull(),
    country: t.text("country"),
    isActive: t.boolean("is_active").notNull().default(true),
    ...timestamps(t),
}));
