"use client";

import { Badge } from "@/components/ui/badge";
import { LogLevel, LogType } from "@workspace/config";

const TYPE_TO_VARIANT: Record<
    LogType,
    "default" | "secondary" | "outline" | "destructive"
> = {
    auth: "outline",
    booking: "default",
    course: "secondary",
    teacher: "secondary",
    testimonial: "secondary",
    banner: "secondary",
    feature: "secondary",
    media: "secondary",
    about: "secondary",
    configuration: "outline",
    cron: "outline",
    system: "outline",
};

export function LogTypeBadge({ type }: { type: LogType }) {
    return (
        <Badge
            variant={TYPE_TO_VARIANT[type]}
            className="h-5 px-1.5 text-[10px] uppercase"
        >
            {type}
        </Badge>
    );
}

export function LogLevelDot({ level }: { level: LogLevel }) {
    const cls =
        level === "error"
            ? "bg-red-500"
            : level === "warn"
              ? "bg-amber-500"
              : "bg-emerald-500";
    return (
        <span
            className={`size-1.5 shrink-0 rounded-full ${cls}`}
            aria-label={level}
        />
    );
}
