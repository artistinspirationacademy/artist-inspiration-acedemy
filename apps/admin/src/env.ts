import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.url("'DATABASE_URL' must be a valid URL"),
        REDIS_URL: z.string().min(1, "'REDIS_URL' is required"),

        UPLOADTHING_TOKEN: z.string().min(1, "'UPLOADTHING_TOKEN' is required"),

        RESEND_API_KEY: z.string().min(1, "'RESEND_API_KEY' is required"),
        EMAIL_FROM: z.string().min(1, "'EMAIL_FROM' is required"),
        FACULTY_URL: z.url("'FACULTY_URL' must be a valid URL"),

        JWT_SECRET: z
            .string()
            .min(32, "JWT_SECRET must be at least 32 characters"),

        CRON_SECRET: z
            .string()
            .min(16, "CRON_SECRET must be at least 16 characters"),

        EMAIL_FORCE_SEND: z.string().optional(),
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

        UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,

        RESEND_API_KEY: process.env.RESEND_API_KEY,
        EMAIL_FROM: process.env.EMAIL_FROM,
        FACULTY_URL: process.env.FACULTY_URL,

        JWT_SECRET: process.env.JWT_SECRET,

        CRON_SECRET: process.env.CRON_SECRET,

        EMAIL_FORCE_SEND: process.env.EMAIL_FORCE_SEND,

        NEXT_PUBLIC_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_URL,

        NEXT_PUBLIC_UPLOADTHING_BUCKET_ID:
            process.env.NEXT_PUBLIC_UPLOADTHING_BUCKET_ID,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
