import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";

export const courseCategorySchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    slug: z
        .string("Slug is required")
        .min(1, "Slug cannot be empty")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
        ),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const courseSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    courseCategoryId: generateIdSchema({
        isUUID: true,
        error: "Course category ID is required and must be a valid ID",
    }),
    title: z.string("Title is required").min(1, "Title cannot be empty"),
    description: z
        .string("Description is required")
        .min(1, "Description cannot be empty"),
    cardImageKey: z
        .string("Card image key is required")
        .min(1, "Card image key cannot be empty"),
    coverImageKey: z
        .string("Cover image key is required")
        .min(1, "Cover image key cannot be empty"),
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

const courseDetailPosition = z.preprocess(
    (val) =>
        val === undefined || val === null || val === "" ? 1 : Number(val),
    z
        .number("Position must be a number")
        .int("Position must be an integer")
        .positive("Position must be positive")
);

export const courseDetailsSchema = z.discriminatedUnion("type", [
    z.object({
        id: generateIdSchema({
            isUUID: true,
            error: "Course detail ID must be a valid UUID",
        }),
        courseId: courseSchema.shape.id,
        title: z
            .string("Details title is required")
            .min(1, "Details title must be at least 1 character long")
            .trim(),
        content: z.string("Content must be a string for type 'text'"),
        type: z.literal("text"),
        position: courseDetailPosition,
        createdAt: generateDateSchema({
            error: "Created at must be a valid date",
        }),
        updatedAt: generateDateSchema({
            error: "Updated at must be a valid date",
        }),
    }),
    z.object({
        id: generateIdSchema({
            isUUID: true,
            error: "Course detail ID must be a valid UUID",
        }),
        courseId: courseSchema.shape.id,
        title: z
            .string("Details title is required")
            .min(1, "Details title must be at least 1 character long")
            .trim(),
        content: z.array(
            z.object({
                key: z.string("Key is required"),
                value: z.string("Value is required"),
            }),
            "Content must be an array of {key, value} for type 'accordion'"
        ),
        type: z.literal("accordion"),
        position: courseDetailPosition,
        createdAt: generateDateSchema({
            error: "Created at must be a valid date",
        }),
        updatedAt: generateDateSchema({
            error: "Updated at must be a valid date",
        }),
    }),
    z.object({
        id: generateIdSchema({
            isUUID: true,
            error: "Course detail ID must be a valid UUID",
        }),
        courseId: courseSchema.shape.id,
        title: z
            .string("Details title is required")
            .min(1, "Details title must be at least 1 character long")
            .trim(),
        content: z.string("Content must be a string for type 'image'"),
        type: z.literal("image"),
        position: courseDetailPosition,
        createdAt: generateDateSchema({
            error: "Created at must be a valid date",
        }),
        updatedAt: generateDateSchema({
            error: "Updated at must be a valid date",
        }),
    }),
    z.object({
        id: generateIdSchema({
            isUUID: true,
            error: "Course detail ID must be a valid UUID",
        }),
        courseId: courseSchema.shape.id,
        title: z
            .string("Details title is required")
            .min(1, "Details title must be at least 1 character long")
            .trim(),
        content: z.array(
            z.object({
                key: z.string("Key is required"),
                value: z.string("Value is required"),
            }),
            "Content must be an array of {key, value} for type 'grid'"
        ),
        type: z.literal("grid"),
        position: courseDetailPosition,
        createdAt: generateDateSchema({
            error: "Created at must be a valid date",
        }),
        updatedAt: generateDateSchema({
            error: "Updated at must be a valid date",
        }),
    }),
]);

export const createCourseCategorySchema = courseCategorySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const createCourseDetailsBaseSchema = z.object({
    courseId: courseSchema.shape.id,
    title: z
        .string("Details title is required")
        .min(1, "Details title must be at least 1 character long")
        .trim(),
    position: courseDetailPosition,
});

const createCourseDetailBaseSchema = z.object({
    title: z
        .string("Details title is required")
        .min(1, "Details title must be at least 1 character long")
        .trim(),
    position: courseDetailPosition,
});

const createCourseDetailsUnion = z.discriminatedUnion("type", [
    z
        .object({
            type: z.literal("text"),
            content: z.string("Content must be a string for type 'text'"),
        })
        .extend(createCourseDetailBaseSchema.shape),
    z
        .object({
            type: z.literal("accordion"),
            content: z.array(
                z.object({
                    key: z.string("Key is required"),
                    value: z.string("Value is required"),
                }),
                "Content must be an array of {key, value} for type 'accordion'"
            ),
        })
        .extend(createCourseDetailBaseSchema.shape),
    z
        .object({
            type: z.literal("image"),
            content: z.string("Content must be a string for type 'image'"),
        })
        .extend(createCourseDetailBaseSchema.shape),
    z
        .object({
            type: z.literal("grid"),
            content: z.array(
                z.object({
                    key: z.string("Key is required"),
                    value: z.string("Value is required"),
                }),
                "Content must be an array of {key, value} for type 'grid'"
            ),
        })
        .extend(createCourseDetailBaseSchema.shape),
]);

export const createCourseSchema = courseSchema
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        details: z.array(createCourseDetailsUnion).default([]),
    });

export const updateCourseCategorySchema = createCourseCategorySchema.partial();

export const bulkUpdateCourseSchema = courseSchema
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })
    .partial();

export const updateCourseSchema = courseSchema
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })
    .partial()
    .extend({
        details: z
            .array(
                z.discriminatedUnion("type", [
                    z.object({
                        id: generateIdSchema({
                            isUUID: true,
                            error: "Course detail ID must be a valid UUID",
                        }).optional(),
                        title: z
                            .string("Details title is required")
                            .min(
                                1,
                                "Details title must be at least 1 character long"
                            )
                            .trim(),
                        content: z.string(
                            "Content must be a string for type 'text'"
                        ),
                        type: z.literal("text"),
                        position: courseDetailPosition,
                    }),
                    z.object({
                        id: generateIdSchema({
                            isUUID: true,
                            error: "Course detail ID must be a valid UUID",
                        }).optional(),
                        title: z
                            .string("Details title is required")
                            .min(
                                1,
                                "Details title must be at least 1 character long"
                            )
                            .trim(),
                        content: z.array(
                            z.object({
                                key: z.string("Key is required"),
                                value: z.string("Value is required"),
                            })
                        ),
                        type: z.literal("accordion"),
                        position: courseDetailPosition,
                    }),
                    z.object({
                        id: generateIdSchema({
                            isUUID: true,
                            error: "Course detail ID must be a valid UUID",
                        }).optional(),
                        title: z
                            .string("Details title is required")
                            .min(
                                1,
                                "Details title must be at least 1 character long"
                            )
                            .trim(),
                        content: z.string(
                            "Content must be a string for type 'image'"
                        ),
                        type: z.literal("image"),
                        position: courseDetailPosition,
                    }),
                    z.object({
                        id: generateIdSchema({
                            isUUID: true,
                            error: "Course detail ID must be a valid UUID",
                        }).optional(),
                        title: z
                            .string("Details title is required")
                            .min(
                                1,
                                "Details title must be at least 1 character long"
                            )
                            .trim(),
                        content: z.array(
                            z.object({
                                key: z.string("Key is required"),
                                value: z.string("Value is required"),
                            })
                        ),
                        type: z.literal("grid"),
                        position: courseDetailPosition,
                    }),
                ])
            )
            .optional(),
    });

export const fullCourseCategorySchema = courseCategorySchema.extend({
    courses: z.array(courseSchema).nullable().default([]),
});

export const fullCourseSchema = courseSchema.extend({
    category: courseCategorySchema,
    details: z.array(courseDetailsSchema).nullable().default([]),
});

export type CourseCategory = z.infer<typeof courseCategorySchema>;
export type CreateCourseCategory = z.infer<typeof createCourseCategorySchema>;
export type UpdateCourseCategory = z.infer<typeof updateCourseCategorySchema>;
export type FullCourseCategory = z.infer<typeof fullCourseCategorySchema>;

export type CourseDetails = z.infer<typeof courseDetailsSchema>;

export type Course = z.infer<typeof courseSchema>;
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type BulkUpdateCourse = z.infer<typeof bulkUpdateCourseSchema>;
export type FullCourse = z.infer<typeof fullCourseSchema>;
