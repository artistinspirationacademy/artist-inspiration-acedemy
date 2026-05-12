import { bannerContentQueries, bannerQueries } from "./banner";
import { courseCategoryQueries, courseQueries } from "./course";
import { mediaQueries } from "./media";
import { userQueries } from "./user";

export const queries = {
    banner: Object.assign(bannerQueries, {
        content: bannerContentQueries,
    }),
    course: Object.assign(courseQueries, {
        category: courseCategoryQueries,
    }),
    media: mediaQueries,
    user: userQueries,
};
