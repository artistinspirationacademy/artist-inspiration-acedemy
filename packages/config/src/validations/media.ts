import z from "zod";
import { generateDateSchema, generateIdSchema } from "./general";
import { convertEmptyStringToNull } from "../utils";
import { MEDIA_FILE_ACCEPT } from "../const";

export const mediaSchema = z.object({
    id: generateIdSchema({ isUUID: true }),
    name: z.string("Name is required").min(1, "Name cannot be empty"),
    alt: z.preprocess(
        convertEmptyStringToNull,
        z
            .string("Alt text must be a string")
            .min(1, "Alt text cannot be empty")
            .nullable()
    ),
    key: z.string("Key is required").min(1, "Key cannot be empty"),
    type: z.string("Type is required").min(1, "Type cannot be empty"),
    size: z
        .int("Size is required")
        .nonnegative("Size must be a non-negative integer"),
    createdAt: generateDateSchema({ error: "Created at must be a valid date" }),
    updatedAt: generateDateSchema({ error: "Updated at must be a valid date" }),
});

export const createMediaSchema = mediaSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateMediaSchema = mediaSchema
    .pick({ name: true, alt: true })
    .partial();

export const uploadMediaSchema = z
    .union([z.instanceof(File), z.array(z.instanceof(File))])
    .transform((files) => {
        const fileArray = Array.isArray(files) ? files : [files];
        return fileArray;
    })
    .pipe(
        z
            .array(
                z
                    .instanceof(File)
                    .refine(
                        (file) =>
                            MEDIA_FILE_ACCEPT.includes(
                                file.type as unknown as (typeof MEDIA_FILE_ACCEPT)[number]
                            ),
                        {
                            message:
                                "File type not allowed. Supported types: PNG, JPG, JPEG, WEBP, MP4, WAV, MP3, DOCX, PPTX, PDF, XLSX",
                        }
                    )
            )
            .min(1, "At least one file is required")
    );

export type Media = z.infer<typeof mediaSchema>;
export type CreateMedia = z.infer<typeof createMediaSchema>;
export type UpdateMedia = z.infer<typeof updateMediaSchema>;
export type UploadMedia = z.infer<typeof uploadMediaSchema>;
