import { aboutQueries } from "./about";
import { bannerContentQueries, bannerQueries } from "./banner";
import { bookingQueries } from "./booking";
import { courseCategoryQueries, courseQueries } from "./course";
import { mediaQueries } from "./media";
import { teacherQueries } from "./teacher";
import { userQueries } from "./user";

export const queries = {
    about: aboutQueries,
    banner: Object.assign(bannerQueries, {
        content: bannerContentQueries,
    }),
    booking: bookingQueries,
    course: Object.assign(courseQueries, {
        category: courseCategoryQueries,
    }),
    media: mediaQueries,
    teacher: teacherQueries,
    user: userQueries,
};
