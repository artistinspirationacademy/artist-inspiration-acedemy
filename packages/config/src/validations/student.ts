import z from "zod";
import { convertEmptyStringToNull } from "../utils";
import { courseSchema } from "./course";
import {
    emailSchema,
    generateDateSchema,
    generateIdSchema,
    generatePriceSchema,
} from "./general";
import { teacherSchema } from "./teacher";

export const monthKeySchema = z
    .string("Month is required")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in 'YYYY-MM' format");

export const dateKeySchema = z
    .string("Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in 'YYYY-MM-DD' format");

export const studentEnrollmentSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    studentId: generateIdSchema({
        isUUID: true,
        error: "Student ID must be a valid UUID",
    }),
    teacherId: generateIdSchema({
        isUUID: true,
        error: "Teacher ID must be a valid UUID",
    }),
    courseId: generateIdSchema({
        isUUID: true,
        error: "Course ID must be a valid UUID",
    }),
    platformId: z.preprocess(
        convertEmptyStringToNull,
        generateIdSchema({
            isUUID: true,
            error: "Platform ID must be a valid UUID",
        }).nullable()
    ),
    packageId: z.preprocess(
        convertEmptyStringToNull,
        generateIdSchema({
            isUUID: true,
            error: "Package ID must be a valid UUID",
        }).nullable()
    ),
    academyFee: generatePriceSchema({ error: "Academy fee is required" }),
    teacherFee: generatePriceSchema({ error: "Teacher fee is required" }),
    monthlyClasses: z
        .int("Monthly classes is required")
        .nonnegative("Monthly classes must be a non-negative integer")
        .max(31, "Monthly classes cannot exceed 31"),
    classesPerWeek: z
        .int("Classes per week is required")
        .nonnegative("Classes per week must be a non-negative integer")
        .max(7, "Classes per week cannot exceed 7"),
    totalMonths: z.preprocess(
        convertEmptyStringToNull,
        z
            .int("Total months must be an integer")
            .positive("Total months must be greater than 0")
            .max(120, "Total months cannot exceed 120")
            .nullable()
    ),
    startMonth: dateKeySchema,
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createStudentEnrollmentSchema = studentEnrollmentSchema
    .omit({
        id: true,
        studentId: true,
        startMonth: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        startMonth: monthKeySchema,
    });

export const updateStudentEnrollmentSchema = studentEnrollmentSchema
    .pick({
        teacherId: true,
        courseId: true,
        platformId: true,
        packageId: true,
        academyFee: true,
        teacherFee: true,
        monthlyClasses: true,
        classesPerWeek: true,
        totalMonths: true,
        isActive: true,
    })
    .extend({
        startMonth: monthKeySchema,
    })
    .partial();

export const fullStudentEnrollmentSchema = studentEnrollmentSchema.extend({
    teacher: teacherSchema,
    course: courseSchema,
});

export const studentSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    serialNo: z
        .int("Serial number is required")
        .positive("Serial number must be greater than 0"),
    code: z.preprocess(
        convertEmptyStringToNull,
        z
            .string("Student ID must be a string")
            .min(1, "Student ID cannot be empty")
            .max(50, "Student ID cannot exceed 50 characters")
            .nullable()
    ),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    email: z.preprocess(convertEmptyStringToNull, emailSchema.nullable()),
    phone: z.preprocess(
        convertEmptyStringToNull,
        z
            .string("Phone must be a string")
            .min(1, "Phone cannot be empty")
            .nullable()
    ),
    guardianName: z.preprocess(
        convertEmptyStringToNull,
        z
            .string("Guardian name must be a string")
            .min(1, "Guardian name cannot be empty")
            .nullable()
    ),
    notes: z.preprocess(
        convertEmptyStringToNull,
        z.string("Notes must be a string").nullable()
    ),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createStudentSchema = studentSchema
    .omit({
        id: true,
        serialNo: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        enrollments: z
            .array(createStudentEnrollmentSchema)
            .min(1, "At least one enrollment is required"),
    });

export const updateStudentSchema = createStudentSchema.partial();

export const bulkUpdateStudentSchema = studentSchema
    .pick({ isActive: true })
    .partial();

export const fullStudentSchema = studentSchema.extend({
    enrollments: z.array(fullStudentEnrollmentSchema).default([]),
});

/**
 * What the faculty portal receives for its own students: the academy fee is
 * omitted — not nulled — so a spread can never leak it (B2 invariant).
 */
export const facultyFullStudentEnrollmentSchema =
    fullStudentEnrollmentSchema.omit({ academyFee: true });

export const facultyFullStudentSchema = studentSchema.extend({
    enrollments: z.array(facultyFullStudentEnrollmentSchema).default([]),
});

export type StudentEnrollment = z.infer<typeof studentEnrollmentSchema>;
export type CreateStudentEnrollment = z.infer<
    typeof createStudentEnrollmentSchema
>;
export type UpdateStudentEnrollment = z.infer<
    typeof updateStudentEnrollmentSchema
>;
export type FullStudentEnrollment = z.infer<typeof fullStudentEnrollmentSchema>;
export type Student = z.infer<typeof studentSchema>;
export type CreateStudent = z.infer<typeof createStudentSchema>;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;
export type BulkUpdateStudent = z.infer<typeof bulkUpdateStudentSchema>;
export type FullStudent = z.infer<typeof fullStudentSchema>;
export type FacultyFullStudentEnrollment = z.infer<
    typeof facultyFullStudentEnrollmentSchema
>;
export type FacultyFullStudent = z.infer<typeof facultyFullStudentSchema>;
