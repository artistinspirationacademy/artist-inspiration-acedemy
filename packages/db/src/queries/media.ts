import { MEDIA_TYPE_PATTERNS, mediaSchema } from "@workspace/config";
import { db } from "../client";

function getTypeFilter(type: string | undefined) {
    if (!type?.length) return undefined;

    const patterns =
        MEDIA_TYPE_PATTERNS[type as keyof typeof MEDIA_TYPE_PATTERNS];
    if (!patterns) return undefined;

    if (patterns.length === 1) return { ilike: patterns[0]! };
    return { OR: patterns.map((pattern) => ({ ilike: pattern })) };
}

class MediaQuery {
    async scan({ ids, type }: { ids?: string[]; type?: string } = {}) {
        const typeFilter = getTypeFilter(type);
        const data = await db.query.media.findMany({
            where: {
                AND: [
                    ...(ids?.length ? [{ id: { in: ids } }] : []),
                    ...(typeFilter ? [{ type: typeFilter }] : []),
                ],
            },
            orderBy: (f, o) => o.desc(f.createdAt),
        });

        const parsed = mediaSchema.array().parse(data);
        return parsed;
    }
}
