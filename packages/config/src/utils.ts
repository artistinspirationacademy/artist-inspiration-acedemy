import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import {
    CURRENCY,
    MAX_MEDIA_FILE_SIZE,
    MEDIA_FILE_ACCEPT,
    MEDIA_FILE_ACCEPT_LABELS,
    MESSAGES,
    STUDENT_ID_PREFIX,
} from "./const";
import { ResponseData, ResponseMessages } from "./validations";

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Outside production, emails are suppressed so local work never spends a real
 * send. Callers surface the link they would have mailed instead. Set
 * `EMAIL_FORCE_SEND=true` to exercise real delivery in development.
 */
export function shouldSkipEmailDelivery() {
    if (process.env.EMAIL_FORCE_SEND === "true") return false;
    return process.env.NODE_ENV !== "production";
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

/**
 * Best-effort client IP extraction. Honors common reverse-proxy headers,
 * falling back to a stable sentinel so rate-limit keys never become empty.
 */
export function getClientIp(req: Request): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const first = forwardedFor.split(",")[0]?.trim();
        if (first) return first;
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp;
    const cfConnecting = req.headers.get("cf-connecting-ip");
    if (cfConnecting) return cfConnecting;
    return "unknown";
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

export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );
    const value = bytes / Math.pow(1024, i);
    return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

export interface MediaFileRejection {
    file: File;
    reason: string;
}

export interface MediaFileValidation {
    accepted: File[];
    rejected: MediaFileRejection[];
}

export function validateMediaFiles(files: File[]): MediaFileValidation {
    const allowed = MEDIA_FILE_ACCEPT as readonly string[];
    const accepted: File[] = [];
    const rejected: MediaFileRejection[] = [];

    for (const file of files) {
        if (!allowed.includes(file.type.toLowerCase())) {
            rejected.push({
                file,
                reason: `Unsupported file type. Allowed: ${MEDIA_FILE_ACCEPT_LABELS.join(", ")}`,
            });
            continue;
        }
        if (file.size > MAX_MEDIA_FILE_SIZE) {
            rejected.push({
                file,
                reason: `Exceeds ${formatBytes(MAX_MEDIA_FILE_SIZE)} limit (file is ${formatBytes(file.size)})`,
            });
            continue;
        }
        accepted.push(file);
    }

    return { accepted, rejected };
}

export function reportMediaRejections(rejected: MediaFileRejection[]) {
    if (rejected.length === 0) return;
    const groups = new Map<string, string[]>();
    for (const { file, reason } of rejected) {
        const names = groups.get(reason) ?? [];
        names.push(file.name);
        groups.set(reason, names);
    }
    for (const [reason, names] of groups) {
        const shown = names.slice(0, 3).join(", ");
        const more = names.length > 3 ? ` and ${names.length - 3} more` : "";
        toast.error(`${shown}${more}: ${reason}`);
    }
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

export function formatFeeTag(fee: number, keepDecimals = false) {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
        style: "currency",
        currency: CURRENCY.CODE,
        minimumFractionDigits: keepDecimals ? 2 : 0,
        maximumFractionDigits: keepDecimals ? 2 : 0,
    }).format(fee);
}

export function formatStudentNo(serialNo: number) {
    return `${STUDENT_ID_PREFIX}-${String(serialNo).padStart(4, "0")}`;
}

export function displayStudentId(student: {
    code?: string | null;
    serialNo: number;
}) {
    return student.code || formatStudentNo(student.serialNo);
}

export function monthKey(date: Date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isMonthKey(value: string) {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function parseMonthKey(key: string) {
    const [year, month] = key.split("-").map(Number);
    if (!year || !month) throw new Error(`Invalid month key: '${key}'`);
    return { year, month };
}

export function dateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthStart(key: string) {
    return `${key}-01`;
}

export function monthKeyOf(date: string) {
    return date.slice(0, 7);
}

export function monthDayCount(key: string) {
    const { year, month } = parseMonthKey(key);
    return new Date(year, month, 0).getDate();
}

export function monthDates(key: string) {
    const { year, month } = parseMonthKey(key);

    return Array.from({ length: monthDayCount(key) }, (_, i) => {
        const date = new Date(year, month - 1, i + 1);
        return {
            day: i + 1,
            date: dateKey(date),
            weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
        };
    });
}

export function shiftMonthKey(key: string, delta: number) {
    const { year, month } = parseMonthKey(key);
    return monthKey(new Date(year, month - 1 + delta, 1));
}

/**
 * An enrollment is billed from `startMonth` for `totalMonths` months. A null
 * `totalMonths` means it runs indefinitely.
 */
export function isMonthInEnrollmentWindow({
    month,
    startMonth,
    totalMonths,
}: {
    month: string;
    startMonth: string;
    totalMonths: number | null;
}) {
    const startKey = monthKeyOf(startMonth);
    if (month < startKey) return false;
    if (!totalMonths) return true;

    return month <= shiftMonthKey(startKey, totalMonths - 1);
}

/**
 * 1-based position of `month` inside an enrollment's plan — the "3" in
 * "3 of 6". Null when the month falls outside the enrollment window.
 */
export function enrollmentMonthOrdinal({
    month,
    startMonth,
    totalMonths,
}: {
    month: string;
    startMonth: string;
    totalMonths: number | null;
}) {
    const startKey = monthKeyOf(startMonth);
    if (month < startKey) return null;

    const start = parseMonthKey(startKey);
    const current = parseMonthKey(month);
    const ordinal =
        (current.year - start.year) * 12 + (current.month - start.month) + 1;

    if (totalMonths && ordinal > totalMonths) return null;
    return ordinal;
}

/**
 * Human-readable span for an enrollment, e.g. "Jul 2026 → Sep 2026" or
 * "From Jul 2026 · ongoing" when no length is set.
 */
export function formatEnrollmentWindow({
    startMonth,
    totalMonths,
}: {
    startMonth: string;
    totalMonths: number | null;
}) {
    const startKey = monthKeyOf(startMonth);
    if (!isMonthKey(startKey)) return null;

    const start = formatMonthKey(startKey);
    if (!totalMonths) return `From ${start} · ongoing`;
    if (totalMonths === 1) return `${start} only`;

    return `${start} → ${formatMonthKey(shiftMonthKey(startKey, totalMonths - 1))}`;
}

export function formatMonthKey(key: string) {
    const { year, month } = parseMonthKey(key);
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
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

/**
 * Random password for admin-provisioned faculty accounts. Always satisfies
 * `passwordSchema` (one of each class is guaranteed) and draws from
 * `crypto.getRandomValues`, so it is safe to use client-side in the dialogs.
 */
export function generatePassword(length = 14) {
    const CLASSES = [
        "ABCDEFGHJKLMNPQRSTUVWXYZ",
        "abcdefghijkmnpqrstuvwxyz",
        "23456789",
        "!@#$%&*?",
    ];
    const pool = CLASSES.join("");

    const pick = (chars: string) => {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        return chars[buffer[0]! % chars.length]!;
    };

    const chars = CLASSES.map(pick);
    while (chars.length < Math.max(length, CLASSES.length))
        chars.push(pick(pool));

    // Fisher–Yates so the guaranteed classes aren't always up front
    for (let i = chars.length - 1; i > 0; i--) {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        const j = buffer[0]! % (i + 1);
        [chars[i], chars[j]] = [chars[j]!, chars[i]!];
    }

    return chars.join("");
}

export function generateCustomCacheKey(
    keys: (string | undefined)[],
    prefix: string,
    separator = "::"
) {
    return (
        prefix +
        separator +
        keys
            .map((k) => k ?? "*")
            .filter(Boolean)
            .join(separator)
    );
}
