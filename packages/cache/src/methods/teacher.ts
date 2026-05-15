import {
    FullTeacher,
    fullTeacherSchema,
    parseToJSON,
    Teacher,
    teacherSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { getAllKeys, redis } from "../client";

const listKey = "teachers";
const byCourseKey = (courseId: string) => `teachers:course:${courseId}`;
const byIdKey = (id: string) => `teachers:id:${id}`;

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

    async byId(id: string): Promise<FullTeacher | null> {
        const key = byIdKey(id);
        const cachedRaw = await redis.get(key);
        let cached = fullTeacherSchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            cached = await queries.teacher.get({ id, include: "courses" });
            if (!cached) return null;
            await redis.set(key, JSON.stringify(cached));
        }

        return cached;
    }

    async drop() {
        const keys = await getAllKeys("teachers*");
        if (keys.length) await redis.del(...keys);
    }
}

export const teacherCache = new TeacherCache();
