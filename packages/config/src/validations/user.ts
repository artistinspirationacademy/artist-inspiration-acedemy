import z from "zod";
import {
    emailSchema,
    generateDateSchema,
    generateIdSchema,
    passwordSchema,
} from "./general";

export const userSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    firstName: z
        .string("First name is required")
        .min(1, "First name cannot be empty"),
    lastName: z
        .string("Last name is required")
        .min(1, "Last name cannot be empty"),
    email: emailSchema,
    password: passwordSchema,
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const safeUserSchema = userSchema.omit({ password: true });

export type User = z.infer<typeof userSchema>;
export type SafeUser = z.infer<typeof safeUserSchema>;
