import { DEFAULT_PAGINATION } from "@workspace/config";
import z from "zod";

export function generateIdSchema({
    isUUID,
    isNumeric,
    isString,
    error,
}: {
    isUUID?: boolean;
    isNumeric?: boolean;
    isString?: boolean;
    error?: string;
}) {
    return z.string().refine(
        (val) => {
            if (isUUID) return z.uuid().safeParse(val).success;
            if (isNumeric)
                return z.string().min(1).max(100).safeParse(val).success;
            if (isString)
                return z.string().min(1).max(100).safeParse(val).success;

            return false;
        },
        { message: error || "Invalid ID" }
    );
}

export const generateDateSchema = ({ error }: { error?: string }) => {
    return z
        .union([z.string(), z.date()], {
            error: error || "Date is required",
        })
        .transform((v) => new Date(v));
};

export const nameSchema = z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters");

export const emailSchema = z.email("Email address is invalid");

export const passwordSchema = z
    .string("Password is required")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s:]).{8,}$/,
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
    );

export const deleteDataSchema = z.object({
    ids: z.preprocess(
        (val) => {
            if (typeof val === "string" && val.length > 0)
                return [...new Set(val.split(",").map((v) => v.trim()))];

            return [];
        },
        z
            .array(z.string("ID must be a string"))
            .min(1, "At least one ID is required")
            .max(100, "More than 100 IDs are not allowed")
    ),
});

export const paginationQuerySchema = z.object({
    limit: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return Number(val);
    }, z.int("Limit must be an integer").min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(DEFAULT_PAGINATION.GENERAL.LIMIT)),
    page: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return Number(val);
    }, z.int("Page must be an integer").min(1, "Page must be at least 1").optional().default(DEFAULT_PAGINATION.GENERAL.PAGE)),
    search: z.string("Search must be a string").optional(),
    isPaginated: z.preprocess((val) => {
        if (val === undefined) return true;
        return val === "true";
    }, z.boolean("isPaginated must be a boolean").optional().default(true)),
    ids: z.preprocess(
        (val) => {
            if (typeof val === "string" && val.length > 0)
                return [...new Set(val.split(",").map((v) => v.trim()))];

            return undefined;
        },
        z
            .array(z.string("ID must be a string"))
            .max(100, "More than 100 IDs are not allowed")
            .optional()
    ),
});

export function generatePriceSchema(
    options: {
        error?: string;
        nonNegativeError?: string;
    } = {}
) {
    return z
        .union([z.number(), z.string()], {
            message: options.error || "Price is required",
        })
        .transform((v) => Number(v))
        .pipe(
            z
                .number({
                    message: options.error || "Price must be a number",
                })
                .nonnegative(
                    options.nonNegativeError || "Price must be non-negative"
                )
        );
}
