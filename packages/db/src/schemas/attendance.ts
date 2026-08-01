import {
    ATTENDANCE_EDITOR_ROLES,
    ATTENDANCE_STATUSES,
} from "@workspace/config";
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { studentEnrollments } from "./student";

export const attendanceMonths = pgTable(
    "attendance_months",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        enrollmentId: t
            .uuid("enrollment_id")
            .notNull()
            .references(() => studentEnrollments.id, { onDelete: "cascade" }),
        month: t.date("month", { mode: "string" }).notNull(),
        academyFee: t
            .numeric("academy_fee", { precision: 10, scale: 2, mode: "number" })
            .notNull()
            .default(0),
        teacherFee: t
            .numeric("teacher_fee", { precision: 10, scale: 2, mode: "number" })
            .notNull()
            .default(0),
        monthlyClasses: t.integer("monthly_classes").notNull().default(0),
        totalMonths: t.integer("total_months"),
        notes: t.text("notes"),
        isLocked: t.boolean("is_locked").notNull().default(false),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("attendance_months_enrollment_month_uidx").on(
            t.enrollmentId,
            t.month
        ),
        index("attendance_months_month_idx").on(t.month),
        index("attendance_months_enrollment_id_idx").on(t.enrollmentId),
    ]
);

export const attendanceDays = pgTable(
    "attendance_days",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        attendanceMonthId: t
            .uuid("attendance_month_id")
            .notNull()
            .references(() => attendanceMonths.id, { onDelete: "cascade" }),
        date: t.date("date", { mode: "string" }).notNull(),
        status: t.text("status", { enum: ATTENDANCE_STATUSES }).notNull(),
        updatedByRole: t
            .text("updated_by_role", { enum: ATTENDANCE_EDITOR_ROLES })
            .notNull(),
        updatedById: t.uuid("updated_by_id").notNull(),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("attendance_days_month_date_uidx").on(
            t.attendanceMonthId,
            t.date
        ),
        index("attendance_days_date_idx").on(t.date),
        index("attendance_days_attendance_month_id_idx").on(
            t.attendanceMonthId
        ),
    ]
);
