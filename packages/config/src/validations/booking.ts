import z from "zod";
import { emailSchema, generateDateSchema, generateIdSchema } from "./general";

export const bookingSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    email: emailSchema,
    phone: z
        .string("Phone number is required")
        .min(1, "Phone number cannot be empty")
        .regex(/^[+0-9]+$/, "Phone number can only contain numbers and +"),
    age: z.int("Age is required").positive("Age must be a positive integer"),
    gender: z.string("Gender is required").min(1, "Gender cannot be empty"),
    courseId: generateIdSchema({
        isUUID: true,
        error: "Course ID is required and must be a valid ID",
    }),
    experienceLevel: z
        .string("Experience level is required")
        .min(1, "Experience level cannot be empty"),
    country: z.string("Country is required").min(1, "Country cannot be empty"),
    timestamp: z.date("Timestamp is required and must be a valid date"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createBookingSchema = bookingSchema.omit({
    id: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
});

export const updateBookingSchema = bookingSchema.pick({
    isActive: true,
});

export const fullBookingSchema = bookingSchema.extend({});

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
export type FullBooking = z.infer<typeof fullBookingSchema>;
