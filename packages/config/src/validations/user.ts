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

export const updateProfileSchema = userSchema.pick({
    firstName: true,
    lastName: true,
});

export const updateEmailSchema = z.object({
    email: emailSchema,
    currentPassword: z
        .string("Current password is required")
        .min(1, "Current password is required"),
});

export const updatePasswordSchema = z
    .object({
        currentPassword: z
            .string("Current password is required")
            .min(1, "Current password is required"),
        newPassword: passwordSchema,
        confirmPassword: z.string("Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        path: ["newPassword"],
        message: "New password must be different from your current password",
    });

export type User = z.infer<typeof userSchema>;
export type SafeUser = z.infer<typeof safeUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
