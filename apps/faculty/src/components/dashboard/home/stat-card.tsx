"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn, Icons, type IconName } from "@workspace/config";

export function StatCard({
    label,
    value,
    hint,
    icon,
    tone = "default",
}: {
    label: string;
    value: string | number;
    hint?: string;
    icon: IconName;
    tone?: "default" | "positive" | "negative" | "warning";
}) {
    const Icon = Icons[icon];

    return (
        <Card size="sm" className="gap-2">
            <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-xs font-medium">
                        {label}
                    </p>
                    <Icon className="text-muted-foreground size-4" />
                </div>

                <p
                    className={cn(
                        "font-heading text-2xl font-semibold tabular-nums",
                        tone === "positive" &&
                            "text-emerald-600 dark:text-emerald-400",
                        tone === "negative" && "text-red-600 dark:text-red-400",
                        tone === "warning" &&
                            "text-amber-600 dark:text-amber-400"
                    )}
                >
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>

                {hint && (
                    <p className="text-muted-foreground text-[11px]">{hint}</p>
                )}
            </CardContent>
        </Card>
    );
}
