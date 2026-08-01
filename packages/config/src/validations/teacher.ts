import z from "zod";
import { convertEmptyStringToNull } from "../utils";
import { courseSchema } from "./course";
import {
    emailSchema,
    generateDateSchema,
    generateIdSchema,
    passwordSchema,
} from "./general";

export const teacherSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    about: z.string("About is required").min(1, "About cannot be empty"),
    imageKey: z
        .string("Image key is required")
        .min(1, "Image key cannot be empty"),
    videoKey: z.preprocess(
        convertEmptyStringToNull,
        z
            .string("Video key must be a string")
            .min(1, "Video key cannot be empty")
            .nullable()
    ),
    rating: z
        .number("Rating is required")
        .min(0.5, "Rating must be at least 0.5")
        .max(5, "Rating cannot exceed 5")
        .multipleOf(0.5, "Rating must be in 0.5 increments"),
    experience: z
        .number("Experience is required")
        .positive("Experience must be greater than 0"),
    position: z
        .int("Position is required")
        .nonnegative("Position must be a non-negative integer"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createTeacherSchema = teacherSchema
    .omit({
        id: true,
        position: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        courseIds: z
            .array(
                generateIdSchema({
                    isUUID: true,
                    error: "Course ID must be a valid UUID",
                })
            )
            .min(1, "At least one course is required"),
    });

export const createTeacherWithAccountSchema = createTeacherSchema
    .extend({
        facultyEmail: z.preprocess(
            convertEmptyStringToNull,
            emailSchema.nullable()
        ),
        facultyPassword: z.preprocess(
            convertEmptyStringToNull,
            passwordSchema.nullable()
        ),
    })
    .refine((data) => !!data.facultyEmail === !!data.facultyPassword, {
        path: ["facultyPassword"],
        message:
            "The faculty account needs both an email and a password — fill in both or neither",
    });

export const updateTeacherSchema = createTeacherSchema.partial();

export const fullTeacherSchema = teacherSchema.extend({
    courses: z.array(courseSchema).default([]),
});

export const reorderTeacherSchema = z
    .array(
        z.object({
            id: generateIdSchema({ isUUID: true }),
            position: z
                .int("Position is required")
                .nonnegative("Position must be a non-negative integer"),
        })
    )
    .min(1, "At least one teacher is required");

export type Teacher = z.infer<typeof teacherSchema>;
export type CreateTeacher = z.infer<typeof createTeacherSchema>;
export type CreateTeacherWithAccount = z.infer<
    typeof createTeacherWithAccountSchema
>;
export type UpdateTeacher = z.infer<typeof updateTeacherSchema>;
export type FullTeacher = z.infer<typeof fullTeacherSchema>;
export type ReorderTeacher = z.infer<typeof reorderTeacherSchema>;
