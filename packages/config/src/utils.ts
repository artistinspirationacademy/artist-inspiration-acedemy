import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { ResponseData, ResponseMessages } from "./validations";
import { toast } from "sonner";
import { MESSAGES } from "./const";

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getAbsoluteURL(path: string = "/") {
    if (process.env.NEXT_PUBLIC_DEPLOYMENT_URL)
        return `https://${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}${path}`;
    else if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}${path}`;
    return "http://localhost:3000" + path;
}

export class AppError extends Error {
    status: ResponseMessages;

    constructor(message: string, status: ResponseMessages = "BAD_REQUEST") {
        super(message);
        this.name = "AppError";
        this.status = status;
    }
}

export function sanitizeError(error: unknown): string {
    if (error instanceof AppError) return error.message;
    else if (error instanceof ZodError)
        return error.issues.map((x) => x.message).join(", ");
    else if (error instanceof Error) return error.message;
    else return MESSAGES.ERRORS.GENERAL.GENERIC;
}

export function handleError(error: unknown) {
    console.error(error);

    if (error instanceof AppError)
        return CResponse({
            message: error.status,
            longMessage: sanitizeError(error),
        });
    else if (error instanceof ZodError)
        return CResponse({
            message: "BAD_REQUEST",
            longMessage: sanitizeError(error),
        });
    else if (
        Object.prototype.hasOwnProperty.call(error, "error") &&
        Object.prototype.hasOwnProperty.call(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).error,
            "description"
        )
    )
        return CResponse({
            message: "BAD_REQUEST",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            longMessage: (error as any).error.description,
        });
    else if (error instanceof Error)
        return CResponse({
            message: "INTERNAL_SERVER_ERROR",
            longMessage: error.message,
        });
    else return CResponse({ message: "INTERNAL_SERVER_ERROR" });
}

export class FetchError extends Error {
    status: number;
    statusText: string;
    url: string;
    data?: unknown;

    constructor({
        status,
        statusText,
        url,
        data,
        message,
    }: {
        status: number;
        statusText: string;
        url: string;
        data?: unknown;
        message?: string;
    }) {
        super(message ?? `Request failed with ${status} ${statusText}: ${url}`);
        this.name = "FetchError";
        this.status = status;
        this.statusText = statusText;
        this.url = url;
        this.data = data;
    }
}

async function parseFetchBody(res: Response) {
    if (res.status === 204 || res.status === 205) return null;

    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
    const isJSON =
        contentType.includes("application/json") ||
        contentType.includes("+json");

    if (isJSON) {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }

    return await res.text();
}

export async function cFetchOrThrow<T>(
    url: string,
    options?: CFetchOptions<T>
): Promise<T> {
    const { schema, throwOnHTTPError = true, ...fetchOptions } = options ?? {};

    const res = await fetch(url, fetchOptions);
    const data = await parseFetchBody(res);

    if (!res.ok && throwOnHTTPError)
        throw new FetchError({
            status: res.status,
            statusText: res.statusText,
            url,
            data,
            message: (data as { longMessage?: string } | null)?.longMessage,
        });

    const responseData = data as ResponseData<T>;
    if (!responseData?.success)
        throw new FetchError({
            status: res.status,
            statusText: res.statusText,
            url,
            data,
            message: responseData?.longMessage,
        });

    const innerData = responseData.data as T;
    if (schema) return schema.parse(innerData);
    return innerData;
}

export async function cFetch<T>(
    url: string,
    options?: CFetchOptions<T>
): Promise<CFetchSafeResult<T>> {
    try {
        const data = await cFetchOrThrow<T>(url, options);
        return {
            ok: true,
            data,
            error: null,
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error,
        };
    }
}

export function CResponse(): NextResponse;
export function CResponse<T>(params: {
    data: T;
    longMessage?: string;
    message?: "OK";
}): NextResponse;
export function CResponse<T>(params: {
    message: ResponseMessages;
    longMessage?: string;
    data?: T;
}): NextResponse;
export function CResponse<T>(params?: {
    message?: ResponseMessages;
    longMessage?: string;
    data?: T;
}) {
    const { message = "OK", longMessage, data } = params ?? {};
    let code: number;
    let success = false;

    switch (message) {
        case "OK":
            success = true;
            code = 200;
            break;
        case "CREATED":
            success = true;
            code = 201;
            break;
        case "BAD_REQUEST":
            code = 400;
            break;
        case "ERROR":
            code = 400;
            break;
        case "UNAUTHORIZED":
            code = 401;
            break;
        case "FORBIDDEN":
            code = 403;
            break;
        case "NOT_FOUND":
            code = 404;
            break;
        case "CONFLICT":
            code = 409;
            break;
        case "TOO_MANY_REQUESTS":
            code = 429;
            break;
        case "UNPROCESSABLE_ENTITY":
            code = 422;
            break;
        case "INTERNAL_SERVER_ERROR":
            code = 500;
            break;
        case "UNKNOWN_ERROR":
            code = 500;
            break;
        case "NOT_IMPLEMENTED":
            code = 501;
            break;
        case "BAD_GATEWAY":
            code = 502;
            break;
        case "SERVICE_UNAVAILABLE":
            code = 503;
            break;
        case "GATEWAY_TIMEOUT":
            code = 504;
            break;
        default:
            code = 500;
            break;
    }

    return NextResponse.json(
        { success, longMessage, data },
        { status: code, statusText: message }
    );
}

export function handleClientError(
    error: unknown,
    _: unknown,
    ctx?: { toastId?: string | number }
) {
    return toast.error(sanitizeError(error), { id: ctx?.toastId });
}

export function slugify(str: string, separator: string = "-") {
    return str
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, separator);
}

export function parseToJSON<T>(data: string): T;
export function parseToJSON<T>(data: string | null | undefined): T | null;
export function parseToJSON<T>(data?: string | null): T | null {
    if (!data) return null;
    if (typeof data !== "string") return data as T;
    return JSON.parse(data);
}

export function convertValueToLabel(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(/[_-\s]/)
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(" ");
}

export function convertEmptyStringToNull<T = unknown>(data: T): T | null {
    return typeof data === "string" && data === "" ? null : data;
}

export function formatPriceTag(price: number, keepDeciamls = false) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: keepDeciamls ? 2 : 0,
    }).format(price);
}

export function truncateText(text: string, length: number) {
    return text.length > length ? text.slice(0, length) + "..." : text;
}

export function isUUID(value: string) {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function generateUploadThingURL(fileKey: string) {
    const bucketId = process.env.NEXT_PUBLIC_UPLOADTHING_BUCKET_ID;
    if (!bucketId)
        throw new Error("'NEXT_PUBLIC_UPLOADTHING_BUCKET_ID' is not defined");

    return `https://${bucketId}.ufs.sh/f/${fileKey}`;
}
