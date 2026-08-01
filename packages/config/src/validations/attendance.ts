import z from "zod";
import { ATTENDANCE_EDITOR_ROLES, ATTENDANCE_STATUSES } from "../const";
import { convertEmptyStringToNull } from "../utils";
import { courseSchema } from "./course";
import {
    generateDateSchema,
    generateIdSchema,
    generatePriceSchema,
} from "./general";
import { dateKeySchema, monthKeySchema, studentSchema } from "./student";

export const attendanceDaySchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    attendanceMonthId: generateIdSchema({
        isUUID: true,
        error: "Attendance month ID must be a valid UUID",
    }),
    date: dateKeySchema,
    status: z.enum(ATTENDANCE_STATUSES, "Status is invalid"),
    updatedByRole: z.enum(ATTENDANCE_EDITOR_ROLES, "Editor role is invalid"),
    updatedById: generateIdSchema({
        isUUID: true,
        error: "Editor ID must be a valid UUID",
    }),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const attendanceMonthSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    enrollmentId: generateIdSchema({
        isUUID: true,
        error: "Enrollment ID must be a valid UUID",
    }),
    month: dateKeySchema,
    academyFee: generatePriceSchema({ error: "Academy fee is required" }),
    teacherFee: generatePriceSchema({ error: "Teacher fee is required" }),
    monthlyClasses: z
        .int("Monthly classes is required")
        .nonnegative("Monthly classes must be a non-negative integer")
        .max(31, "Monthly classes cannot exceed 31"),
    totalMonths: z.preprocess(
        convertEmptyStringToNull,
        z
            .int("Total months must be an integer")
            .positive("Total months must be greater than 0")
            .max(120, "Total months cannot exceed 120")
            .nullable()
    ),
    notes: z.preprocess(
        convertEmptyStringToNull,
        z.string("Notes must be a string").nullable()
    ),
    isLocked: z.boolean("Is locked is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

/**
 * The faculty copy of a month row. `academyFee` is omitted — not nulled — so a
 * spread of this shape can never leak what the student pays the academy.
 */
export const facultyAttendanceMonthSchema = attendanceMonthSchema.omit({
    academyFee: true,
});

export const updateAttendanceMonthSchema = attendanceMonthSchema
    .pick({
        academyFee: true,
        teacherFee: true,
        monthlyClasses: true,
        totalMonths: true,
        notes: true,
        isLocked: true,
    })
    .partial();

export const markAttendanceSchema = z
    .array(
        z.object({
            attendanceMonthId: generateIdSchema({
                isUUID: true,
                error: "Attendance month ID must be a valid UUID",
            }),
            date: dateKeySchema,
            status: z.enum(ATTENDANCE_STATUSES, "Status is invalid").nullable(),
        })
    )
    .min(1, "At least one day is required")
    .max(200, "More than 200 days are not allowed");

export const attendanceTotalsSchema = z.object({
    present: z.int().nonnegative(),
    absent: z.int().nonnegative(),
    rescheduled: z.int().nonnegative(),
    marked: z.int().nonnegative(),
});

const attendanceSheetEnrollmentSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    teacherId: generateIdSchema({ isUUID: true }),
    courseId: generateIdSchema({ isUUID: true }),
    academyFee: generatePriceSchema({ error: "Academy fee is required" }),
    teacherFee: generatePriceSchema({ error: "Teacher fee is required" }),
    monthlyClasses: z.int().nonnegative(),
    classesPerWeek: z.int().nonnegative(),
    totalMonths: z.int().positive().nullable(),
    startMonth: dateKeySchema,
    isActive: z.boolean(),
});

export const attendanceSheetRowSchema = attendanceMonthSchema.extend({
    student: studentSchema,
    enrollment: attendanceSheetEnrollmentSchema,
    course: courseSchema,
    days: z.array(attendanceDaySchema).default([]),
    totals: attendanceTotalsSchema,
});

export const facultyAttendanceSheetRowSchema =
    facultyAttendanceMonthSchema.extend({
        student: studentSchema,
        enrollment: attendanceSheetEnrollmentSchema.omit({ academyFee: true }),
        course: courseSchema,
        days: z.array(attendanceDaySchema).default([]),
        totals: attendanceTotalsSchema,
    });

export const attendanceSheetSchema = z.object({
    month: monthKeySchema,
    teacherId: generateIdSchema({ isUUID: true }),
    rows: z.array(attendanceSheetRowSchema).default([]),
    count: z.int().nonnegative(),
    pages: z.int().nonnegative(),
});

export const facultyAttendanceSheetSchema = attendanceSheetSchema.extend({
    rows: z.array(facultyAttendanceSheetRowSchema).default([]),
});

export const attendanceSheetQuerySchema = z.object({
    month: monthKeySchema,
    limit: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return Number(val);
    }, z.int("Limit must be an integer").min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(50)),
    page: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return Number(val);
    }, z.int("Page must be an integer").min(1, "Page must be at least 1").optional().default(1)),
});

export const attendanceSummarySchema = z.object({
    month: monthKeySchema,
    studentCount: z.int().nonnegative(),
    totals: attendanceTotalsSchema,
    expectedClasses: z.int().nonnegative(),
    classesLeft: z.int().nonnegative(),
    academyFeeTotal: z.number().nonnegative(),
    teacherFeeTotal: z.number().nonnegative(),
});

export const facultyAttendanceSummarySchema = attendanceSummarySchema.omit({
    academyFeeTotal: true,
});

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export type AttendanceEditorRole = (typeof ATTENDANCE_EDITOR_ROLES)[number];
export type AttendanceDay = z.infer<typeof attendanceDaySchema>;
export type AttendanceMonth = z.infer<typeof attendanceMonthSchema>;
export type FacultyAttendanceMonth = z.infer<
    typeof facultyAttendanceMonthSchema
>;
export type UpdateAttendanceMonth = z.infer<typeof updateAttendanceMonthSchema>;
export type MarkAttendance = z.infer<typeof markAttendanceSchema>;
export type AttendanceTotals = z.infer<typeof attendanceTotalsSchema>;
export type AttendanceSheetRow = z.infer<typeof attendanceSheetRowSchema>;
export type FacultyAttendanceSheetRow = z.infer<
    typeof facultyAttendanceSheetRowSchema
>;
export type AttendanceSheet = z.infer<typeof attendanceSheetSchema>;
export type FacultyAttendanceSheet = z.infer<
    typeof facultyAttendanceSheetSchema
>;
export type AttendanceSummary = z.infer<typeof attendanceSummarySchema>;
export type FacultyAttendanceSummary = z.infer<
    typeof facultyAttendanceSummarySchema
>;
