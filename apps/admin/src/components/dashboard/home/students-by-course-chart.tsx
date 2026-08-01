"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardGroupCount, truncateText } from "@workspace/config";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// One nominal series, so one hue and no legend — the title names what is plotted.
const chartConfig: ChartConfig = {
    count: { label: "Students", color: "var(--chart-2)" },
};

export function StudentsByCourseChart({
    data,
}: {
    data: DashboardGroupCount[];
}) {
    const rows = data.map((d) => ({
        ...d,
        label: truncateText(d.label, 22),
    }));

    return (
        <Card size="sm" className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Students by course</CardTitle>
                <p className="text-muted-foreground text-xs">
                    Distinct students on an active enrollment
                </p>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
                        No enrollments yet
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[220px] w-full"
                    >
                        <BarChart
                            data={rows}
                            layout="vertical"
                            margin={{ left: 0, right: 16, top: 4, bottom: 0 }}
                        >
                            <CartesianGrid horizontal={false} />
                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                width={130}
                                tick={{ fontSize: 11 }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent indicator="line" />
                                }
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--color-count)"
                                radius={[0, 4, 4, 0]}
                                maxBarSize={24}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
