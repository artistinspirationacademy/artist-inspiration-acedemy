import z from "zod";
import { fullCourseCategorySchema } from "./course";

export const coursesPageSchema = z.object({
    categories: fullCourseCategorySchema.array(),
});

export type CoursesPage = z.infer<typeof coursesPageSchema>;
