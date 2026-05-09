import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const bookings = pgTable("bookings", (t) => ({
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
    ...timestamps(t),
}));
