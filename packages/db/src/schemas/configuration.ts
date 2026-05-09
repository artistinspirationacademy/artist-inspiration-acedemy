import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const configuration = pgTable("configuration", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    learnerCount: t.integer("learner_count").notNull().default(0),
    countryCount: t.integer("country_count").notNull().default(0),
    teacherCount: t.integer("teacher_count").notNull().default(0),
    ...timestamps(t),
}));
