import { index, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const bookings = pgTable(
    "bookings",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        name: t.text("name").notNull(),
        email: t.text("email"),
        phone: t.text("phone").notNull(),
        age: t.integer("age").notNull(),
        gender: t.text("gender").notNull(),
        courseId: t.uuid("course_id").notNull(),
        experienceLevel: t.text("experience_level").notNull(),
        country: t.text("country").notNull(),
        timestamp: t.timestamp("timestamp").notNull().defaultNow(),
        isActive: t.boolean("is_active").notNull().default(false),
        ...timestamps(t),
    }),
    (t) => [
        index("bookings_course_id_idx").on(t.courseId),
        index("bookings_email_idx").on(t.email),
        index("bookings_timestamp_idx").on(t.timestamp),
    ]
);
