import { parseToJSON, Teacher, teacherSchema } from "@workspace/config";
import { queries } from "@workspace/db";
import { getAllKeys, redis } from "../client";

const listKey = "teachers";
const byCourseKey = (courseId: string) => `teachers:course:${courseId}`;

class TeacherCache {
    async list(): Promise<Teacher[]> {
        const cachedRaw = await redis.get(listKey);
        let cached = teacherSchema
            .array()
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            cached = await queries.teacher.scan({ isActive: true });
            await redis.set(listKey, JSON.stringify(cached));
        }

        return cached;
    }

    async byCourse(courseId: string): Promise<Teacher[]> {
        const key = byCourseKey(courseId);
        const cachedRaw = await redis.get(key);
        let cached = teacherSchema
            .array()
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            cached = await queries.teacher.scan({ courseId, isActive: true });
            await redis.set(key, JSON.stringify(cached));
        }

        return cached;
    }

    async drop() {
        const courseKeys = await getAllKeys("teachers:course:*");
        await redis.del(listKey, ...(courseKeys.length ? courseKeys : []));
    }
}

export const teacherCache = new TeacherCache();
