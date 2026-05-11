import z from "zod";
import { bannerContentSchema, bannerSchema } from "./banner";

export const homeSchema = z.object({
    banners: bannerSchema.array(),
    bannerContent: bannerContentSchema.nullable(),
});

export type Home = z.infer<typeof homeSchema>;
