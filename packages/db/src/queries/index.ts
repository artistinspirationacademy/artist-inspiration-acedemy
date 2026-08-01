import { aboutQueries } from "./about";
import { attendanceQueries } from "./attendance";
import { bannerContentQueries, bannerQueries } from "./banner";
import { bookingQueries } from "./booking";
import { configurationQueries } from "./configuration";
import { courseCategoryQueries, courseQueries } from "./course";
import { dashboardQueries } from "./dashboard";
import { facultyQueries } from "./faculty";
import { featureQueries } from "./feature";
import { logArchiveQueries } from "./log";
import { masterQueries } from "./master";
import { mediaQueries } from "./media";
import { notificationQueries } from "./notification";
import { packageQueries } from "./package";
import { platformQueries } from "./platform";
import { studentQueries } from "./student";
import { teacherQueries } from "./teacher";
import { testimonialQueries } from "./testimonial";
import { userQueries } from "./user";

export const queries = {
    about: aboutQueries,
    attendance: attendanceQueries,
    banner: Object.assign(bannerQueries, {
        content: bannerContentQueries,
    }),
    booking: bookingQueries,
    configuration: configurationQueries,
    course: Object.assign(courseQueries, {
        category: courseCategoryQueries,
    }),
    dashboard: dashboardQueries,
    faculty: facultyQueries,
    feature: featureQueries,
    logArchive: logArchiveQueries,
    master: masterQueries,
    media: mediaQueries,
    notification: notificationQueries,
    package: packageQueries,
    platform: platformQueries,
    student: studentQueries,
    teacher: teacherQueries,
    testimonial: testimonialQueries,
    user: userQueries,
};
