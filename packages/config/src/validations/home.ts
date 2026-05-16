import z from "zod";
import { bannerContentSchema, bannerSchema } from "./banner";
import { configurationSchema } from "./configuration";
import { featureSchema } from "./feature";
import { fullTestimonialSchema } from "./testimonial";

export const homeSchema = z.object({
    banners: bannerSchema.array(),
    bannerContent: bannerContentSchema.nullable(),
    features: featureSchema.array(),
    testimonials: fullTestimonialSchema.array(),
    configuration: configurationSchema.nullable(),
});

export type Home = z.infer<typeof homeSchema>;
