import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.url("'DATABASE_URL' must be a valid URL"),
        REDIS_URL: z.string().min(1, "'REDIS_URL' is required"),

        UPLOADTHING_TOKEN: z.string().min(1, "'UPLOADTHING_TOKEN' is required"),
    },
    client: {
        NEXT_PUBLIC_DEPLOYMENT_URL: z
            .url("'NEXT_PUBLIC_DEPLOYMENT_URL' must be a valid URL")
            .optional(),

        NEXT_PUBLIC_SUPABASE_URL: z.url(
            "'NEXT_PUBLIC_SUPABASE_URL' must be a valid URL"
        ),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z
            .string()
            .min(1, "'NEXT_PUBLIC_SUPABASE_ANON_KEY' is required"),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,

        UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,

        NEXT_PUBLIC_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
