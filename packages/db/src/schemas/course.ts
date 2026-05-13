import { COURSE_DETAIL_TYPES } from "@workspace/config";
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const courseCategories = pgTable(
    "course_categories",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        slug: t.text("slug").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("course_categories_slug_uidx").on(t.slug),
        index("course_categories_is_active_idx").on(t.isActive),
    ]
);

export const courses = pgTable(
    "courses",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        courseCategoryId: t
            .uuid("course_category_id")
            .notNull()
            .references(() => courseCategories.id),
        title: t.text("title").notNull(),
        description: t.text("description").notNull(),
        cardImageKey: t.text("card_image_key").notNull(),
        coverImageKey: t.text("cover_image_key").notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        index("courses_course_category_id_idx").on(t.courseCategoryId),
        index("courses_is_active_idx").on(t.isActive),
    ]
);

export const courseDetails = pgTable(
    "course_details",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        courseId: t
            .uuid("course_id")
            .notNull()
            .references(() => courses.id),
        title: t.text("title").notNull(),
        content: t.jsonb("content").notNull(),
        type: t.text("type", { enum: COURSE_DETAIL_TYPES }).notNull(),
        position: t.integer("position").notNull(),
        ...timestamps(t),
    }),
    (t) => [
        index("course_details_course_id_idx").on(t.courseId),
        index("course_details_type_idx").on(t.type),
        index("course_details_position_idx").on(t.position),
    ]
);
