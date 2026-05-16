import { configurationSchema, UpdateConfiguration } from "@workspace/config";
import { db } from "../client";
import { configuration } from "../schemas";
import { eq } from "drizzle-orm";

class ConfigurationQuery {
    async get() {
        const data = await db.query.configuration.findFirst();
        if (!data) return null;
        return configurationSchema.parse(data);
    }

    async update(values: UpdateConfiguration) {
        const existing = await this.get();

        if (existing) {
            const data = await db
                .update(configuration)
                .set({ ...values, updatedAt: new Date() })
                .where(eq(configuration.id, existing.id))
                .returning()
                .then((res) => res[0]);

            return data ? configurationSchema.parse(data) : null;
        }

        const data = await db
            .insert(configuration)
            .values({
                learnerCount: values.learnerCount ?? 0,
                countryCount: values.countryCount ?? 0,
                teacherCount: values.teacherCount ?? 0,
                contentHoursCount: values.contentHoursCount ?? 0,
                enableBooking: values.enableBooking ?? true,
                redisLogRetentionDays: values.redisLogRetentionDays ?? 7,
                archiveRetentionDays: values.archiveRetentionDays ?? 365,
            })
            .returning()
            .then((res) => res[0]);

        return data ? configurationSchema.parse(data) : null;
    }
}

export const configurationQueries = new ConfigurationQuery();
