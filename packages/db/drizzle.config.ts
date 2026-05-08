import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env", quiet: true });

export default defineConfig({
    schema: "./src/schemas/index.ts",
    dialect: "postgresql",
    out: "./drizzle",
    dbCredentials: { url: process.env.DATABASE_URL! },
});
