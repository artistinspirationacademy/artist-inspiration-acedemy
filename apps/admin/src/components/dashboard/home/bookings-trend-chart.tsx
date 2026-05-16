"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardSeriesPoint } from "@workspace/config";
import { format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig: ChartConfig = {
    count: {
        label: "Bookings",
        color: "var(--chart-1)",
    },
};

export function BookingsTrendChart({ data }: { data: DashboardSeriesPoint[] }) {
    const total = data.reduce((acc, p) => acc + p.count, 0);

    return (
        <Card size="sm" className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <CardTitle>Bookings — last 30 days</CardTitle>
                    <p className="text-muted-foreground text-sm tabular-nums">
                        {total.toLocaleString()} total
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[220px] w-full"
                >
                    <AreaChart
                        data={data}
                        margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="fillBookings"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-count)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-count)"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(v: string) =>
                                format(parseISO(v), "MMM d")
                            }
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={28}
                            allowDecimals={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelFormatter={(v) =>
                                        format(
                                            parseISO(v as string),
                                            "MMM d, yyyy"
                                        )
                                    }
                                />
                            }
                        />
                        <Area
                            dataKey="count"
                            type="monotone"
                            fill="url(#fillBookings)"
                            stroke="var(--color-count)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
