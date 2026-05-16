"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardGroupCount } from "@workspace/config";
import { Cell, Pie, PieChart } from "recharts";

const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--muted-foreground)",
];

const chartConfig: ChartConfig = {
    count: { label: "Bookings" },
};

export function BookingsByCountryChart({
    data,
}: {
    data: DashboardGroupCount[];
}) {
    const total = data.reduce((acc, d) => acc + d.count, 0);

    return (
        <Card size="sm">
            <CardHeader>
                <CardTitle>Bookings by country</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
                        No data
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-square h-[180px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            nameKey="label"
                                        />
                                    }
                                />
                                <Pie
                                    data={data}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius={48}
                                    outerRadius={72}
                                    paddingAngle={2}
                                    strokeWidth={0}
                                >
                                    {data.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <ul className="flex-1 space-y-1.5 text-sm">
                            {data.map((d, i) => (
                                <li
                                    key={d.key}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <span
                                            className="size-2 shrink-0 rounded-xs"
                                            style={{
                                                backgroundColor:
                                                    COLORS[i % COLORS.length],
                                            }}
                                        />
                                        <span className="truncate">
                                            {d.label}
                                        </span>
                                    </span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {total > 0
                                            ? `${Math.round(
                                                  (d.count / total) * 100
                                              )}%`
                                            : "0%"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
