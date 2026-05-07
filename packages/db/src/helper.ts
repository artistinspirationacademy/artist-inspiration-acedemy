import { getPgColumnBuilders } from "drizzle-orm/pg-core/columns/all";

export const timestamps = (t: ReturnType<typeof getPgColumnBuilders>) => ({
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
});
