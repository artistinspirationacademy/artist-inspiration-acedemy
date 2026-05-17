import { aboutQueries } from "./about";
import { bannerContentQueries, bannerQueries } from "./banner";
import { bookingQueries } from "./booking";
import { configurationQueries } from "./configuration";
import { courseCategoryQueries, courseQueries } from "./course";
import { dashboardQueries } from "./dashboard";
import { featureQueries } from "./feature";
import { logArchiveQueries } from "./log";
import { mediaQueries } from "./media";
import { notificationQueries } from "./notification";
import { teacherQueries } from "./teacher";
import { testimonialQueries } from "./testimonial";
import { userQueries } from "./user";

export const queries = {
    about: aboutQueries,
    banner: Object.assign(bannerQueries, {
        content: bannerContentQueries,
    }),
    booking: bookingQueries,
    configuration: configurationQueries,
    course: Object.assign(courseQueries, {
        category: courseCategoryQueries,
    }),
    dashboard: dashboardQueries,
    feature: featureQueries,
    logArchive: logArchiveQueries,
    media: mediaQueries,
    notification: notificationQueries,
    teacher: teacherQueries,
    testimonial: testimonialQueries,
    user: userQueries,
};
