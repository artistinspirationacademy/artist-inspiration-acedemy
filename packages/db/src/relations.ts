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
        enrollments: r.many.studentEnrollments({
            from: r.courses.id,
            to: r.studentEnrollments.courseId,
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
        account: r.one.facultyUsers({
            from: r.teachers.id,
            to: r.facultyUsers.teacherId,
        }),
        enrollments: r.many.studentEnrollments({
            from: r.teachers.id,
            to: r.studentEnrollments.teacherId,
        }),
    },
    facultyUsers: {
        teacher: r.one.teachers({
            from: r.facultyUsers.teacherId,
            to: r.teachers.id,
            optional: false,
        }),
    },
    students: {
        enrollments: r.many.studentEnrollments({
            from: r.students.id,
            to: r.studentEnrollments.studentId,
        }),
    },
    studentEnrollments: {
        student: r.one.students({
            from: r.studentEnrollments.studentId,
            to: r.students.id,
            optional: false,
        }),
        teacher: r.one.teachers({
            from: r.studentEnrollments.teacherId,
            to: r.teachers.id,
            optional: false,
        }),
        course: r.one.courses({
            from: r.studentEnrollments.courseId,
            to: r.courses.id,
            optional: false,
        }),
        platform: r.one.platforms({
            from: r.studentEnrollments.platformId,
            to: r.platforms.id,
        }),
        package: r.one.packages({
            from: r.studentEnrollments.packageId,
            to: r.packages.id,
        }),
        months: r.many.attendanceMonths({
            from: r.studentEnrollments.id,
            to: r.attendanceMonths.enrollmentId,
        }),
    },
    platforms: {
        enrollments: r.many.studentEnrollments({
            from: r.platforms.id,
            to: r.studentEnrollments.platformId,
        }),
    },
    packages: {
        enrollments: r.many.studentEnrollments({
            from: r.packages.id,
            to: r.studentEnrollments.packageId,
        }),
    },
    attendanceMonths: {
        enrollment: r.one.studentEnrollments({
            from: r.attendanceMonths.enrollmentId,
            to: r.studentEnrollments.id,
            optional: false,
        }),
        days: r.many.attendanceDays({
            from: r.attendanceMonths.id,
            to: r.attendanceDays.attendanceMonthId,
        }),
    },
    attendanceDays: {
        month: r.one.attendanceMonths({
            from: r.attendanceDays.attendanceMonthId,
            to: r.attendanceMonths.id,
            optional: false,
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
