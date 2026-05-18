export const MEDIA_TYPES = ["image", "video", "audio", "document"] as const;

export const MEDIA_FILE_ACCEPT = [
    // Images
    "image/webp",
    // Videos
    "video/webm",
    // Audio
    "audio/wav",
    "audio/mp3",
    "audio/mpeg", // Alternative MIME type for mp3
    // Documents
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
] as const;

export const MEDIA_FILE_ACCEPT_LABELS = [
    "WEBP",
    "WEBM",
    "WAV",
    "MP3",
    "DOCX",
    "PPTX",
    "PDF",
    "XLSX",
] as const;

export const MAX_MEDIA_FILE_SIZE = 200 * 1024 * 1024;

export const MEDIA_TYPE_PATTERNS: Record<
    (typeof MEDIA_TYPES)[number],
    string[]
> = {
    image: ["image/%"],
    video: ["video/%"],
    audio: ["audio/%"],
    document: ["application/%"],
} as const;

export const COOKIES = {
    ADMIN: "admin_aia__651456",
} as const;

export const BANNER_MEDIA_TYPES = ["image", "video"] as const;

export const DEFAULT_PFP_URL =
    "https://utfs.io/f/tgjx8p7aDhPeNbVvZa4UDsSHEIjC7GZY9ABuaeVPkrbivNMF" as const;

export const DEFAULT_PAGINATION = {
    GENERAL: {
        LIMIT: 10,
        PAGE: 1,
    },
} as const;

export const MESSAGES = {
    ERRORS: {
        AUTH: {
            INVALID_CREDENTIALS: "Invalid credentials",
        },
        GENERAL: {
            GENERIC: "An error occurred, please try again",
            UNAUTHORIZED: "You are not authorized to perform this action",
            FORBIDDEN: "You do not have permission to access this resource",
            NOT_FOUND: "The requested resource was not found",
            CONFLICT: "The resource already exists",
            BAD_REQUEST: "The request is invalid",
            INTERNAL_SERVER_ERROR: "An internal server error occurred",
            INVALID_IDS: (ids: string[]) =>
                `Invalid IDs: ${ids.map((id) => `'${id}'`).join(", ")}`,
        },
        JWT: {
            NO_USER_ROLE: "No user role found in token",
            UNAUTHORIZED_ROLE: ({
                currentRole,
                allowedRoles,
            }: {
                currentRole: string;
                allowedRoles: readonly string[];
            }) =>
                `Role '${currentRole}' not authorized. Required roles: ${allowedRoles.map((role) => `'${role}'`).join(", ")}`,
        },
        MEDIA: {
            FILES_FIELD_NOT_PROVIDED: "No 'files' field provided in upload",
            NO_VALID_FILES: "No valid files to upload",
            UPLOAD_FAILED: "Failed to upload files",
        },
    },
} as const;

export const COURSE_DETAIL_TYPES = [
    "text",
    "accordion",
    "image",
    "grid",
] as const;

export const ABOUT_SECTION_TYPES = [
    "text",
    "image",
    "image_text",
    "image_text_reverse",
    "accordion",
    "grid",
    "quote",
    "cta",
] as const;

export const LOG_TYPES = [
    "auth",
    "booking",
    "course",
    "teacher",
    "testimonial",
    "banner",
    "feature",
    "media",
    "about",
    "configuration",
    "cron",
    "system",
] as const;

export const LOG_LEVELS = ["info", "warn", "error"] as const;

export const NOTIFICATION_TYPES = ["booking_created"] as const;

export const NOTIFICATION_STATUSES = ["unread", "read", "archived"] as const;

export const DEFAULT_NOTIFICATION_POLL_MS = 60_000;

export const DEFAULT_LOG_RETENTION = {
    REDIS_DAYS: 7,
    ARCHIVE_DAYS: 365,
} as const;
