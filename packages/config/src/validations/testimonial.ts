import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";
import { courseSchema } from "./course";

export const testimonialSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    feedback: z
        .string("Feedback is required")
        .min(1, "Feedback cannot be empty"),
    avatarKey: z.string().nullable(),
    courseId: generateIdSchema({ isUUID: true }).nullable(),
    rating: z
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    country: z.string().nullable(),
    position: z
        .int("Position is required")
        .nonnegative("Position must be a non-negative integer"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const fullTestimonialSchema = testimonialSchema.extend({
    course: courseSchema.nullable(),
});

export const createTestimonialSchema = testimonialSchema.omit({
    id: true,
    position: true,
    createdAt: true,
    updatedAt: true,
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const reorderTestimonialSchema = z
    .array(
        z.object({
            id: generateIdSchema({ isUUID: true }),
            position: z
                .int("Position is required")
                .nonnegative("Position must be a non-negative integer"),
        })
    )
    .min(1, "At least one testimonial is required");

export type Testimonial = z.infer<typeof testimonialSchema>;
export type FullTestimonial = z.infer<typeof fullTestimonialSchema>;
export type CreateTestimonial = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonial = z.infer<typeof updateTestimonialSchema>;
export type ReorderTestimonial = z.infer<typeof reorderTestimonialSchema>;
