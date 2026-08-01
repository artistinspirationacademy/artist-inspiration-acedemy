import z from "zod";
import { FACULTY_ACCOUNT_STATUSES } from "../const";
import {
    emailSchema,
    generateDateSchema,
    generateIdSchema,
    passwordSchema,
} from "./general";
import { fullTeacherSchema, teacherSchema } from "./teacher";

export const facultyUserSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    teacherId: generateIdSchema({
        isUUID: true,
        error: "Teacher ID must be a valid UUID",
    }),
    email: emailSchema,
    password: z.string("Password is required").nullable(),
    isActive: z.boolean("Is active is required"),
    lastLoginAt: generateDateSchema({
        error: "Last login at must be a valid date",
    }).nullable(),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const safeFacultyUserSchema = facultyUserSchema
    .omit({ password: true })
    .extend({
        status: z.enum(FACULTY_ACCOUNT_STATUSES),
    });

export const fullFacultyUserSchema = safeFacultyUserSchema.extend({
    teacher: teacherSchema,
});

export const teacherWithAccountSchema = fullTeacherSchema.extend({
    account: safeFacultyUserSchema.nullable().default(null),
});

/**
 * `loginUrl` is only populated when email delivery was skipped — in
 * development the caller shows the credentials in a toast instead of relying
 * on the mailed copy.
 */
export const facultyAccountResultSchema = safeFacultyUserSchema.extend({
    loginUrl: z.string().nullable().default(null),
});

export const createFacultyAccountSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const updateFacultyAccountSchema = z
    .object({
        email: emailSchema,
        isActive: z.boolean("Is active is required"),
        password: passwordSchema,
    })
    .partial();

export const facultySignInSchema = z.object({
    email: emailSchema,
    password: z.string("Password is required").min(1, "Password is required"),
});

export type FacultyAccountStatus = (typeof FACULTY_ACCOUNT_STATUSES)[number];
export type FacultyUser = z.infer<typeof facultyUserSchema>;
export type SafeFacultyUser = z.infer<typeof safeFacultyUserSchema>;
export type FullFacultyUser = z.infer<typeof fullFacultyUserSchema>;
export type TeacherWithAccount = z.infer<typeof teacherWithAccountSchema>;
export type FacultyAccountResult = z.infer<typeof facultyAccountResultSchema>;
export type CreateFacultyAccount = z.infer<typeof createFacultyAccountSchema>;
export type UpdateFacultyAccount = z.infer<typeof updateFacultyAccountSchema>;
export type FacultySignIn = z.infer<typeof facultySignInSchema>;
