import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { courses } from "./course";

export const teachers = pgTable(
    "teachers",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        courseId: t
            .uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),
        name: t.text("name").notNull(),
        about: t.text("about").notNull(),
        imageKey: t.text("image_key").notNull(),
        rating: t.integer("rating").notNull(),
        experience: t.integer("experience").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        index("teachers_course_id_idx").on(t.courseId),
        index("teachers_is_active_idx").on(t.isActive),
    ]
);
