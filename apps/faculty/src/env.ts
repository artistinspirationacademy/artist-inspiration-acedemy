import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.url("'DATABASE_URL' must be a valid URL"),
        REDIS_URL: z.string().min(1, "'REDIS_URL' is required"),

        RESEND_API_KEY: z.string().min(1, "'RESEND_API_KEY' is required"),
        EMAIL_FROM: z.string().min(1, "'EMAIL_FROM' is required"),

        JWT_SECRET: z
            .string()
            .min(32, "JWT_SECRET must be at least 32 characters"),
    },
    client: {
        NEXT_PUBLIC_DEPLOYMENT_URL: z
            .string("'NEXT_PUBLIC_DEPLOYMENT_URL' must be a valid URL")
            .optional(),

        NEXT_PUBLIC_UPLOADTHING_BUCKET_ID: z
            .string()
            .min(1, "'NEXT_PUBLIC_UPLOADTHING_BUCKET_ID' is required"),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,

        RESEND_API_KEY: process.env.RESEND_API_KEY,
        EMAIL_FROM: process.env.EMAIL_FROM,

        JWT_SECRET: process.env.JWT_SECRET,

        NEXT_PUBLIC_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_URL,

        NEXT_PUBLIC_UPLOADTHING_BUCKET_ID:
            process.env.NEXT_PUBLIC_UPLOADTHING_BUCKET_ID,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
