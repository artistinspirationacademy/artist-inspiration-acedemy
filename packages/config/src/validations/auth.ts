import z from "zod";
import { emailSchema, passwordSchema } from "./general";

export const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type SignIn = z.infer<typeof signInSchema>;
