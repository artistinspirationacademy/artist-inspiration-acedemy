import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";

const sectionPosition = z.preprocess(
    (val) =>
        val === undefined || val === null || val === "" ? 1 : Number(val),
    z
        .number("Position must be a number")
        .int("Position must be an integer")
        .positive("Position must be positive")
);

const titleField = z
    .string("Title is required")
    .min(1, "Title must be at least 1 character long")
    .trim();

const optionalText = z
    .string()
    .trim()
    .optional()
    .or(z.literal(""));

const keyValueArray = z.array(
    z.object({
        key: z.string("Key is required").min(1, "Key cannot be empty"),
        value: z.string("Value is required").min(1, "Value cannot be empty"),
    })
);

const imageTextContent = z.object({
    imageKey: z
        .string("Image is required")
        .min(1, "Image cannot be empty"),
    heading: optionalText,
    text: z
        .string("Text is required")
        .min(1, "Text cannot be empty"),
});

const quoteContent = z.object({
    text: z
        .string("Quote text is required")
        .min(1, "Quote cannot be empty"),
    author: optionalText,
    role: optionalText,
});

const ctaContent = z.object({
    heading: z
        .string("Heading is required")
        .min(1, "Heading cannot be empty"),
    description: optionalText,
    buttonText: z
        .string("Button text is required")
        .min(1, "Button text cannot be empty"),
    buttonLink: z
        .string("Button link is required")
        .min(1, "Button link cannot be empty"),
});

const baseAdminFields = {
    id: generateIdSchema({
        isUUID: true,
        error: "About section ID must be a valid UUID",
    }),
    title: titleField,
    position: sectionPosition,
    isActive: z.boolean("Is active is required"),
    createdAt: generateDateSchema({
        error: "Created at must be a valid date",
    }),
    updatedAt: generateDateSchema({
        error: "Updated at must be a valid date",
    }),
};

export const aboutSectionSchema = z.discriminatedUnion("type", [
    z.object({
        ...baseAdminFields,
        type: z.literal("text"),
        content: z.string("Content must be a string for type 'text'"),
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("image"),
        content: z.string("Content must be an image key for type 'image'"),
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("image_text"),
        content: imageTextContent,
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("image_text_reverse"),
        content: imageTextContent,
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("accordion"),
        content: keyValueArray,
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("grid"),
        content: keyValueArray,
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("quote"),
        content: quoteContent,
    }),
    z.object({
        ...baseAdminFields,
        type: z.literal("cta"),
        content: ctaContent,
    }),
]);

const createBase = z.object({
    title: titleField,
    position: sectionPosition,
    isActive: z.boolean().default(true),
});

export const createAboutSectionSchema = z.discriminatedUnion("type", [
    z
        .object({
            type: z.literal("text"),
            content: z.string("Content must be a string for type 'text'"),
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("image"),
            content: z.string("Content must be an image key for type 'image'"),
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("image_text"),
            content: imageTextContent,
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("image_text_reverse"),
            content: imageTextContent,
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("accordion"),
            content: keyValueArray,
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("grid"),
            content: keyValueArray,
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("quote"),
            content: quoteContent,
        })
        .extend(createBase.shape),
    z
        .object({
            type: z.literal("cta"),
            content: ctaContent,
        })
        .extend(createBase.shape),
]);

export const replaceAboutSchema = z.object({
    sections: z.array(createAboutSectionSchema),
});

export type AboutSection = z.infer<typeof aboutSectionSchema>;
export type CreateAboutSection = z.infer<typeof createAboutSectionSchema>;
export type ReplaceAbout = z.infer<typeof replaceAboutSchema>;
export type AboutImageTextContent = z.infer<typeof imageTextContent>;
export type AboutQuoteContent = z.infer<typeof quoteContent>;
export type AboutCtaContent = z.infer<typeof ctaContent>;
