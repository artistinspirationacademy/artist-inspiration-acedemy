import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { teachers } from "./teacher";

export const facultyUsers = pgTable(
    "faculty_users",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        teacherId: t
            .uuid("teacher_id")
            .notNull()
            .references(() => teachers.id, { onDelete: "cascade" }),
        email: t.text("email").notNull(),
        password: t.text("password"),
        isActive: t.boolean("is_active").notNull().default(true),
        lastLoginAt: t.timestamp("last_login_at"),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("faculty_users_teacher_id_uidx").on(t.teacherId),
        uniqueIndex("faculty_users_email_uidx").on(t.email),
        index("faculty_users_is_active_idx").on(t.isActive),
    ]
);
