import { defineRelations } from "drizzle-orm";
import * as schema from "./schemas";

export const relations = defineRelations(schema, (r) => ({
    courseCategories: {
        courses: r.many.courses({
            from: r.courseCategories.id,
            to: r.courses.courseCategoryId,
        }),
    },
    courses: {
        category: r.one.courseCategories({
            from: r.courses.courseCategoryId,
            to: r.courseCategories.id,
            optional: false,
        }),
        details: r.many.courseDetails({
            from: r.courses.id,
            to: r.courseDetails.courseId,
        }),
        teachers: r.many.teachers({
            from: r.courses.id.through(r.courseTeachers.courseId),
            to: r.teachers.id.through(r.courseTeachers.teacherId),
        }),
        testimonials: r.many.testimonials({
            from: r.courses.id,
            to: r.testimonials.courseId,
        }),
        bookings: r.many.bookings({
            from: r.courses.id,
            to: r.bookings.courseId,
        }),
    },
    courseDetails: {
        course: r.one.courses({
            from: r.courseDetails.courseId,
            to: r.courses.id,
            optional: false,
        }),
    },
    teachers: {
        courses: r.many.courses({
            from: r.teachers.id.through(r.courseTeachers.teacherId),
            to: r.courses.id.through(r.courseTeachers.courseId),
        }),
    },
    testimonials: {
        course: r.one.courses({
            from: r.testimonials.courseId,
            to: r.courses.id,
            optional: false,
        }),
    },
    bookings: {
        course: r.one.courses({
            from: r.bookings.courseId,
            to: r.courses.id,
            optional: false,
        }),
    },
}));
