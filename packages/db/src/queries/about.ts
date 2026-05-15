import {
    AboutSection,
    aboutSectionSchema,
    CreateAboutSection,
} from "@workspace/config";
import { db } from "../client";
import { aboutSections } from "../schemas";

class AboutQuery {
    async scan(): Promise<AboutSection[]> {
        const data = await db.query.aboutSections.findMany({
            orderBy: { position: "asc" },
        });
        return aboutSectionSchema.array().parse(data);
    }

    async replace(sections: CreateAboutSection[]): Promise<AboutSection[]> {
        return db.transaction(async (tx) => {
            await tx.delete(aboutSections);

            if (!sections.length) return [];

            const inserted = await tx
                .insert(aboutSections)
                .values(
                    sections.map((s) => ({
                        title: s.title,
                        content: s.content as
                            | string
                            | Record<string, unknown>
                            | { key: string; value: string }[],
                        type: s.type,
                        position: s.position,
                        isActive: s.isActive ?? true,
                    }))
                )
                .returning();

            return aboutSectionSchema.array().parse(inserted);
        });
    }
}

export const aboutQueries = new AboutQuery();
