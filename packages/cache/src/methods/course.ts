import {
    coursesPageSchema,
    fullCourseSchema,
    parseToJSON,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { getAllKeys, redis } from "../client";

const listKey = "courses";
const detailKey = (id: string) => `course:${id}`;

class CourseCache {
    async get() {
        const cachedRaw = await redis.get(listKey);
        let cached = coursesPageSchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const categoriesWithCourses = await queries.course.category.scan({
                isActive: true,
                include: "courses",
            });

            const categories = categoriesWithCourses
                .map((category) => ({
                    ...category,
                    courses: (category.courses ?? []).filter(
                        (course) => course.isActive
                    ),
                }))
                .filter((category) => category.courses.length > 0);

            cached = { categories };

            await redis.set(listKey, JSON.stringify(cached));
        }

        return cached;
    }

    async getById(id: string) {
        const key = detailKey(id);
        const cachedRaw = await redis.get(key);
        let cached = fullCourseSchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const course = await queries.course.get({
                id,
                include: "details",
            });
            if (!course) return null;

            cached = course;
            await redis.set(key, JSON.stringify(cached));
        }

        return cached;
    }

    async drop() {
        const detailKeys = await getAllKeys("course:*");
        await redis.del(listKey, ...(detailKeys.length ? detailKeys : []));
    }
}

export const courseCache = new CourseCache();
