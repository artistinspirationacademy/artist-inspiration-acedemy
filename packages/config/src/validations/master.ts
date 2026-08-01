import z from "zod";
import {
    emailSchema,
    generateIdSchema,
    paginationQuerySchema,
} from "./general";
import { dateKeySchema, monthKeySchema } from "./student";

/**
 * One Master Table row = one enrollment (student × teacher × course), with
 * that month's snapshot attached when a sheet row exists. The month snapshot
 * is nullable — a month outside the enrollment window has no sheet row — so
 * the enrollment's contract figures ride along as the display/export
 * fallback.
 */
export const masterRowSchema = z.object({
    enrollmentId: generateIdSchema({ isUUID: true }),
    student: z.object({
        id: generateIdSchema({ isUUID: true }),
        serialNo: z.int().positive(),
        code: z.string().nullable(),
        name: z.string(),
        email: z.string().nullable(),
        phone: z.string().nullable(),
        guardianName: z.string().nullable(),
        notes: z.string().nullable(),
        isActive: z.boolean(),
    }),
    teacher: z.object({
        id: generateIdSchema({ isUUID: true }),
        name: z.string(),
    }),
    course: z.object({
        id: generateIdSchema({ isUUID: true }),
        title: z.string(),
    }),
    platform: z
        .object({
            id: generateIdSchema({ isUUID: true }),
            name: z.string(),
        })
        .nullable(),
    package: z
        .object({
            id: generateIdSchema({ isUUID: true }),
            name: z.string(),
            totalClasses: z.int().positive(),
        })
        .nullable(),
    classesPerWeek: z.int().nonnegative(),
    startMonth: dateKeySchema,
    totalMonths: z.int().positive().nullable(),
    isActive: z.boolean(),
    contract: z.object({
        monthlyClasses: z.int().nonnegative(),
        academyFee: z.number().nonnegative(),
        teacherFee: z.number().nonnegative(),
    }),
    monthSnapshot: z
        .object({
            id: generateIdSchema({ isUUID: true }),
            monthlyClasses: z.int().nonnegative(),
            academyFee: z.number().nonnegative(),
            teacherFee: z.number().nonnegative(),
            isLocked: z.boolean(),
        })
        .nullable(),
    presentMonth: z.int().nonnegative(),
    presentAllTime: z.int().nonnegative(),
    lastMarked: dateKeySchema.nullable(),
});

export const masterTableSchema = z.object({
    month: monthKeySchema,
    data: masterRowSchema.array().default([]),
    count: z.int().nonnegative(),
    pages: z.int().nonnegative(),
});

export const masterQuerySchema = paginationQuerySchema
    .pick({
        limit: true,
        page: true,
        search: true,
    })
    .extend({
        month: monthKeySchema,
        teacherId: generateIdSchema({
            isUUID: true,
            error: "Teacher ID must be a valid UUID",
        }).optional(),
        courseId: generateIdSchema({
            isUUID: true,
            error: "Course ID must be a valid UUID",
        }).optional(),
        platformId: generateIdSchema({
            isUUID: true,
            error: "Platform ID must be a valid UUID",
        }).optional(),
        packageId: generateIdSchema({
            isUUID: true,
            error: "Package ID must be a valid UUID",
        }).optional(),
        isActive: z.preprocess((val) => {
            if (val === undefined || val === null || val === "")
                return undefined;
            return val === "true" || val === true;
        }, z.boolean().optional()),
    });

/**
 * The bulk import/export CSV contract. These header names ARE the API —
 * template, export and import all read/write exactly this set, so an
 * unmodified export always re-imports cleanly.
 */
export const MASTER_CSV_HEADERS = [
    "Student ID",
    "Student Name",
    "Email",
    "Phone",
    "Guardian Name",
    "Notes",
    "Tutor",
    "Course",
    "Platform",
    "Package",
    "Classes/Week",
    "Monthly Classes",
    "Academy Fee",
    "Teacher Fee",
    "Total Months",
    "Start Month",
    "Active",
] as const;

export const IMPORT_MASTER_MAX_ROWS = 500;

const csvCell = (value: unknown) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text === "" ? null : text;
};

const csvNumber = (value: unknown) => {
    const cell = csvCell(value);
    return cell === null ? null : Number(cell);
};

const csvBoolean = (value: unknown) => {
    const cell = csvCell(value);
    if (cell === null) return null;
    if (["true", "yes", "1"].includes(cell.toLowerCase())) return true;
    if (["false", "no", "0"].includes(cell.toLowerCase())) return false;
    return cell;
};

/**
 * One parsed CSV row. Keyed by the header names so validation errors read
 * like the sheet ("Academy Fee: …"), then transformed to the field names the
 * import query works with. Everything arrives as strings from papaparse.
 */
export const importMasterRowSchema = z
    .object({
        "Student ID": z.preprocess(
            csvCell,
            z.string("Student ID is required").max(50)
        ),
        "Student Name": z.preprocess(csvCell, z.string().nullable()),
        Email: z.preprocess(csvCell, emailSchema.nullable()),
        Phone: z.preprocess(csvCell, z.string().nullable()),
        "Guardian Name": z.preprocess(csvCell, z.string().nullable()),
        Notes: z.preprocess(csvCell, z.string().nullable()),
        Tutor: z.preprocess(csvCell, z.string("Tutor is required")),
        Course: z.preprocess(csvCell, z.string("Course is required")),
        Platform: z.preprocess(csvCell, z.string().nullable()),
        Package: z.preprocess(csvCell, z.string().nullable()),
        "Classes/Week": z.preprocess(
            csvNumber,
            z
                .int("Classes/Week must be a whole number")
                .nonnegative("Classes/Week cannot be negative")
                .max(7, "Classes/Week cannot exceed 7")
        ),
        "Monthly Classes": z.preprocess(
            csvNumber,
            z
                .int("Monthly Classes must be a whole number")
                .nonnegative("Monthly Classes cannot be negative")
                .max(31, "Monthly Classes cannot exceed 31")
        ),
        "Academy Fee": z.preprocess(
            csvNumber,
            z
                .number("Academy Fee must be a number")
                .nonnegative("Academy Fee cannot be negative")
        ),
        "Teacher Fee": z.preprocess(
            csvNumber,
            z
                .number("Teacher Fee must be a number")
                .nonnegative("Teacher Fee cannot be negative")
        ),
        "Total Months": z.preprocess(
            csvNumber,
            z
                .int("Total Months must be a whole number")
                .positive("Total Months must be greater than 0")
                .max(120, "Total Months cannot exceed 120")
                .nullable()
        ),
        "Start Month": z.preprocess(csvCell, monthKeySchema),
        Active: z.preprocess(
            csvBoolean,
            z.boolean("Active must be true or false")
        ),
    })
    .transform((row) => ({
        code: row["Student ID"],
        name: row["Student Name"],
        email: row.Email,
        phone: row.Phone,
        guardianName: row["Guardian Name"],
        notes: row.Notes,
        tutor: row.Tutor,
        course: row.Course,
        platform: row.Platform,
        package: row.Package,
        classesPerWeek: row["Classes/Week"],
        monthlyClasses: row["Monthly Classes"],
        academyFee: row["Academy Fee"],
        teacherFee: row["Teacher Fee"],
        totalMonths: row["Total Months"],
        startMonth: row["Start Month"],
        isActive: row.Active,
    }));

export const importMasterPayloadSchema = z.object({
    month: monthKeySchema,
    rows: z
        .array(z.unknown())
        .min(1, "The file has no data rows")
        .max(
            IMPORT_MASTER_MAX_ROWS,
            `Import at most ${IMPORT_MASTER_MAX_ROWS} rows at a time`
        ),
});

/**
 * Row numbers are spreadsheet-style — the header is row 1, so the first data
 * row reports as 2. `action` and `error` are mutually exclusive.
 */
export const importMasterRowResultSchema = z.object({
    row: z.int().positive(),
    id: z.string().nullable(),
    action: z.enum(["created", "updated"]).optional(),
    error: z.string().optional(),
});

export const importMasterResultSchema = z.object({
    created: z.int().nonnegative(),
    updated: z.int().nonnegative(),
    results: importMasterRowResultSchema.array(),
});

export type MasterRow = z.infer<typeof masterRowSchema>;
export type MasterTable = z.infer<typeof masterTableSchema>;
export type MasterQuery = z.infer<typeof masterQuerySchema>;
export type ImportMasterRow = z.infer<typeof importMasterRowSchema>;
export type ImportMasterRowResult = z.infer<typeof importMasterRowResultSchema>;
export type ImportMasterResult = z.infer<typeof importMasterResultSchema>;
