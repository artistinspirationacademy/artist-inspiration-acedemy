import { index, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { courses } from "./course";

export const teachers = pgTable(
    "teachers",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        about: t.text("about").notNull(),
        imageKey: t.text("image_key").notNull(),
        videoKey: t.text("video_key"),
        rating: t.real("rating").notNull(),
        experience: t.real("experience").notNull(),
        position: t.integer("position").notNull().default(0),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        index("teachers_is_active_idx").on(t.isActive),
        index("teachers_position_idx").on(t.position),
    ]
);

export const courseTeachers = pgTable(
    "course_teachers",
    (t) => ({
        courseId: t
            .uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),
        teacherId: t
            .uuid("teacher_id")
            .notNull()
            .references(() => teachers.id, { onDelete: "cascade" }),
        createdAt: t.timestamp("created_at").notNull().defaultNow(),
    }),
    (t) => [
        primaryKey({ columns: [t.courseId, t.teacherId] }),
        index("course_teachers_course_id_idx").on(t.courseId),
        index("course_teachers_teacher_id_idx").on(t.teacherId),
    ]
);
