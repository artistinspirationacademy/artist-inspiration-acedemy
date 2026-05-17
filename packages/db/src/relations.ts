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
        bookings: r.many.bookings({
            from: r.teachers.id,
            to: r.bookings.teacherId,
        }),
    },
    testimonials: {
        course: r.one.courses({
            from: r.testimonials.courseId,
            to: r.courses.id,
            optional: true,
        }),
    },
    bookings: {
        course: r.one.courses({
            from: r.bookings.courseId,
            to: r.courses.id,
            optional: false,
        }),
        teacher: r.one.teachers({
            from: r.bookings.teacherId,
            to: r.teachers.id,
        }),
        notifications: r.many.notifications({
            from: r.bookings.id,
            to: r.notifications.bookingId,
        }),
    },
    notifications: {
        booking: r.one.bookings({
            from: r.notifications.bookingId,
            to: r.bookings.id,
        }),
    },
}));
