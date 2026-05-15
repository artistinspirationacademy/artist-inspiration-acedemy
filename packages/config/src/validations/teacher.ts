import z from "zod";
import { courseSchema } from "./course";
import { generateDateSchema, generateIdSchema } from "./general";

export const teacherSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    courseId: generateIdSchema({
        isUUID: true,
        error: "Course ID is required and must be a valid ID",
    }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    about: z.string("About is required").min(1, "About cannot be empty"),
    imageKey: z
        .string("Image key is required")
        .min(1, "Image key cannot be empty"),
    rating: z
        .int("Rating is required")
        .positive("Rating must be a positive integer"),
    experience: z
        .int("Experience is required")
        .positive("Experience must be a positive integer"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createTeacherSchema = teacherSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const fullTeacherSchema = teacherSchema.extend({
    course: courseSchema,
});

export type Teacher = z.infer<typeof teacherSchema>;
export type CreateTeacher = z.infer<typeof createTeacherSchema>;
export type UpdateTeacher = z.infer<typeof updateTeacherSchema>;
export type FullTeacher = z.infer<typeof fullTeacherSchema>;
