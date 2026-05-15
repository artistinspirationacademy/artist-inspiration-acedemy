import z from "zod";
import { courseSchema } from "./course";
import { generateDateSchema, generateIdSchema } from "./general";

export const teacherSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    about: z.string("About is required").min(1, "About cannot be empty"),
    imageKey: z
        .string("Image key is required")
        .min(1, "Image key cannot be empty"),
    rating: z
        .number("Rating is required")
        .min(0.5, "Rating must be at least 0.5")
        .max(5, "Rating cannot exceed 5")
        .multipleOf(0.5, "Rating must be in 0.5 increments"),
    experience: z
        .number("Experience is required")
        .positive("Experience must be greater than 0"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createTeacherSchema = teacherSchema
    .omit({
        id: true,
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

export const updateTeacherSchema = createTeacherSchema.partial();

export const fullTeacherSchema = teacherSchema.extend({
    courses: z.array(courseSchema).default([]),
});

export type Teacher = z.infer<typeof teacherSchema>;
export type CreateTeacher = z.infer<typeof createTeacherSchema>;
export type UpdateTeacher = z.infer<typeof updateTeacherSchema>;
export type FullTeacher = z.infer<typeof fullTeacherSchema>;
