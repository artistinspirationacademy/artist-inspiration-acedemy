"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    convertValueToLabel,
    DashboardGroupCount,
} from "@workspace/config";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig: ChartConfig = {
    count: { label: "Bookings", color: "var(--chart-4)" },
};

export function BookingsByExperienceChart({
    data,
}: {
    data: DashboardGroupCount[];
}) {
    const rows = data.map((d) => ({
        ...d,
        label: convertValueToLabel(d.label),
    }));

    return (
        <Card size="sm">
            <CardHeader>
                <CardTitle>Experience level mix</CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
                        No data
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[200px] w-full"
                    >
                        <BarChart
                            data={rows}
                            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={28}
                                allowDecimals={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--color-count)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
