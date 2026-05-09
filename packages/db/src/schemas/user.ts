import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const users = pgTable(
    "users",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        firstName: t.text("first_name").notNull(),
        lastName: t.text("last_name").notNull(),
        email: t.text("email").notNull().unique(),
        password: t.text("password").notNull(),
        ...timestamps(t),
    }),
    (t) => [uniqueIndex("users_email_uidx").on(t.email)]
);
