import z from "zod";
import { bannerContentSchema, bannerSchema } from "./banner";
import { featureSchema } from "./feature";
import { fullTestimonialSchema } from "./testimonial";

export const homeSchema = z.object({
    banners: bannerSchema.array(),
    bannerContent: bannerContentSchema.nullable(),
    features: featureSchema.array(),
    testimonials: fullTestimonialSchema.array(),
});

export type Home = z.infer<typeof homeSchema>;
