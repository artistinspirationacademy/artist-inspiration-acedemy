import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.url("'DATABASE_URL' must be a valid URL"),
        REDIS_URL: z.string().min(1, "'REDIS_URL' is required"),
    },
    client: {
        NEXT_PUBLIC_DEPLOYMENT_URL: z
            .url("'NEXT_PUBLIC_DEPLOYMENT_URL' must be a valid URL")
            .optional(),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,

        NEXT_PUBLIC_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_URL,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
