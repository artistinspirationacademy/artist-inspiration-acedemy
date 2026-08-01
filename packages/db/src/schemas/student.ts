import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { courses } from "./course";
import { packages } from "./package";
import { platforms } from "./platform";
import { teachers } from "./teacher";

export const students = pgTable(
    "students",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        serialNo: t.integer("serial_no").notNull().generatedAlwaysAsIdentity(),
        code: t.text("code"),
        name: t.text("name").notNull(),
        email: t.text("email"),
        phone: t.text("phone"),
        guardianName: t.text("guardian_name"),
        notes: t.text("notes"),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("students_serial_no_uidx").on(t.serialNo),
        uniqueIndex("students_code_uidx").on(t.code),
        index("students_name_idx").on(t.name),
        index("students_is_active_idx").on(t.isActive),
    ]
);

export const studentEnrollments = pgTable(
    "student_enrollments",
    (t) => ({
        id: t.uuid("id").notNull().primaryKey().defaultRandom(),
        studentId: t
            .uuid("student_id")
            .notNull()
            .references(() => students.id, { onDelete: "cascade" }),
        teacherId: t
            .uuid("teacher_id")
            .notNull()
            .references(() => teachers.id, { onDelete: "cascade" }),
        courseId: t
            .uuid("course_id")
            .notNull()
            .references(() => courses.id),
        platformId: t
            .uuid("platform_id")
            .references(() => platforms.id, { onDelete: "set null" }),
        packageId: t
            .uuid("package_id")
            .references(() => packages.id, { onDelete: "set null" }),
        academyFee: t
            .numeric("academy_fee", { precision: 10, scale: 2, mode: "number" })
            .notNull()
            .default(0),
        teacherFee: t
            .numeric("teacher_fee", { precision: 10, scale: 2, mode: "number" })
            .notNull()
            .default(0),
        monthlyClasses: t.integer("monthly_classes").notNull().default(0),
        classesPerWeek: t.integer("classes_per_week").notNull().default(0),
        totalMonths: t.integer("total_months"),
        startMonth: t.date("start_month", { mode: "string" }).notNull(),
        isActive: t.boolean("is_active").notNull().default(true),
        ...timestamps(t),
    }),
    (t) => [
        uniqueIndex("student_enrollments_student_teacher_course_uidx").on(
            t.studentId,
            t.teacherId,
            t.courseId
        ),
        index("student_enrollments_student_id_idx").on(t.studentId),
        index("student_enrollments_teacher_id_idx").on(t.teacherId),
        index("student_enrollments_course_id_idx").on(t.courseId),
        index("student_enrollments_is_active_idx").on(t.isActive),
        index("student_enrollments_start_month_idx").on(t.startMonth),
        index("student_enrollments_platform_id_idx").on(t.platformId),
        index("student_enrollments_package_id_idx").on(t.packageId),
    ]
);
