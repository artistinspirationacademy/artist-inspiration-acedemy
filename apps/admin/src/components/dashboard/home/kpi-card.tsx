"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn, DashboardKpi, Icons, type IconName } from "@workspace/config";

function getDelta(kpi: DashboardKpi): {
    pct: number | null;
    direction: "up" | "down" | "flat";
} {
    if (kpi.prev7d === 0) {
        if (kpi.last7d === 0) return { pct: 0, direction: "flat" };
        return { pct: null, direction: "up" };
    }
    const change = ((kpi.last7d - kpi.prev7d) / kpi.prev7d) * 100;
    const direction =
        Math.abs(change) < 0.5 ? "flat" : change > 0 ? "up" : "down";
    return { pct: change, direction };
}

export function KpiCard({
    label,
    icon,
    kpi,
}: {
    label: string;
    icon: IconName;
    kpi: DashboardKpi;
}) {
    const Icon = Icons[icon];
    const { pct, direction } = getDelta(kpi);

    return (
        <Card size="sm" className="gap-2">
            <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-xs font-medium">
                        {label}
                    </p>
                    <Icon className="text-muted-foreground size-4" />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                    <p className="font-heading text-2xl font-semibold tabular-nums">
                        {kpi.total.toLocaleString()}
                    </p>
                    <span
                        className={cn(
                            "text-xs font-medium tabular-nums",
                            direction === "up" && "text-emerald-500",
                            direction === "down" && "text-red-500",
                            direction === "flat" && "text-muted-foreground"
                        )}
                    >
                        {pct === null
                            ? `+${kpi.last7d}`
                            : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`}
                    </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                    {kpi.last7d.toLocaleString()} in last 7 days
                </p>
            </CardContent>
        </Card>
    );
}
