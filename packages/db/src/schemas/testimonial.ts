import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { courses } from "./course";

export const testimonials = pgTable(
    "testimonials",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        feedback: t.text("feedback").notNull(),
        avatarKey: t.text("avatar_key"),
        courseId: t.uuid("course_id").references(() => courses.id, {
            onDelete: "set null",
        }),
        rating: t.integer("rating").notNull(),
        country: t.text("country"),
        position: t.integer("position").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        index("testimonials_course_id_idx").on(t.courseId),
        index("testimonials_position_idx").on(t.position),
        index("testimonials_is_active_idx").on(t.isActive),
    ]
);
