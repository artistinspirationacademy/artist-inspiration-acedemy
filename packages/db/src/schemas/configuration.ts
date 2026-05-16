import { pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";

export const configuration = pgTable("configuration", (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    learnerCount: t.integer("learner_count").notNull().default(0),
    countryCount: t.integer("country_count").notNull().default(0),
    teacherCount: t.integer("teacher_count").notNull().default(0),
    contentHoursCount: t.integer("content_hours_count").notNull().default(0),
    enableBooking: t.boolean("enable_booking").notNull().default(true),
    redisLogRetentionDays: t
        .integer("redis_log_retention_days")
        .notNull()
        .default(7),
    archiveRetentionDays: t
        .integer("archive_retention_days")
        .notNull()
        .default(365),
    ...timestamps(t),
}));
