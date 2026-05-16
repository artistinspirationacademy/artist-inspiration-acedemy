import { aboutQueries } from "./about";
import { bannerContentQueries, bannerQueries } from "./banner";
import { bookingQueries } from "./booking";
import { configurationQueries } from "./configuration";
import { courseCategoryQueries, courseQueries } from "./course";
import { featureQueries } from "./feature";
import { mediaQueries } from "./media";
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
    feature: featureQueries,
    media: mediaQueries,
    teacher: teacherQueries,
    testimonial: testimonialQueries,
    user: userQueries,
};
