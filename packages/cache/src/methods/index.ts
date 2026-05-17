import { aboutCache } from "./about";
import { courseCache } from "./course";
import { dashboardCache } from "./dashboard";
import { homeCache } from "./home";
import { logsCache } from "./logs";
import { notificationCache } from "./notification";
import { rateLimitCache } from "./rate-limit";
import { teacherCache } from "./teacher";

export { enforceRateLimit, resetRateLimit } from "./rate-limit";
export type { RateLimitResult } from "./rate-limit";

export const cache = {
    about: aboutCache,
    course: courseCache,
    dashboard: dashboardCache,
    home: homeCache,
    logs: logsCache,
    notification: notificationCache,
    rateLimit: rateLimitCache,
    teacher: teacherCache,
};
