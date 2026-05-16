"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    convertValueToLabel,
    Icons,
    LOG_TYPES,
    LogEntry,
    LogType,
} from "@workspace/config";
import { useLogs } from "@workspace/rq";
import { format } from "date-fns";
import { useState } from "react";
import { LogLevelDot, LogTypeBadge } from "./log-type-badge";

export function RecentLogs() {
    const [type, setType] = useState<LogType | "all">("all");
    const { useRecent } = useLogs();
    const { data, isPending, isError, refetch, isRefetching } = useRecent({
        type: type === "all" ? undefined : type,
        limit: 200,
    });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Select
                        value={type}
                        onValueChange={(v) => setType(v as LogType | "all")}
                    >
                        <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {LOG_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {convertValueToLabel(t)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="h-8"
                    >
                        <Icons.ArrowCounterClockwise
                            className={
                                isRefetching
                                    ? "size-3.5 animate-spin"
                                    : "size-3.5"
                            }
                        />
                        Refresh
                    </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                    {data?.length ?? 0} entries
                </p>
            </div>

            {isPending ? (
                <ListSkeleton />
            ) : isError ? (
                <ErrorState onRetry={refetch} />
            ) : data && data.length === 0 ? (
                <EmptyState />
            ) : (
                <Card size="sm">
                    <CardContent className="px-0">
                        <ul className="divide-y">
                            {data!.map((entry) => (
                                <LogRow key={entry.id} entry={entry} />
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function LogRow({ entry }: { entry: LogEntry }) {
    const [open, setOpen] = useState(false);
    const hasMeta =
        entry.metadata !== null && Object.keys(entry.metadata).length > 0;

    return (
        <li
            className={
                hasMeta
                    ? "hover:bg-muted/40 cursor-pointer transition-colors"
                    : ""
            }
            onClick={() => hasMeta && setOpen((v) => !v)}
        >
            <div className="flex items-center gap-3 px-4 py-2.5">
                <LogLevelDot level={entry.level} />
                <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <LogTypeBadge type={entry.type} />
                        <p className="text-sm">{entry.message}</p>
                    </div>
                    {entry.actorId && (
                        <p className="text-muted-foreground font-mono text-[11px]">
                            actor: {entry.actorId}
                        </p>
                    )}
                </div>
                <time className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {format(new Date(entry.createdAt), "MMM d, HH:mm:ss")}
                </time>
            </div>
            {hasMeta && open && (
                <pre className="bg-muted/30 mx-4 mb-3 overflow-x-auto rounded-md p-3 font-mono text-[11px] leading-relaxed">
                    {JSON.stringify(entry.metadata, null, 2)}
                </pre>
            )}
        </li>
    );
}

function ListSkeleton() {
    return (
        <Card size="sm">
            <CardContent className="space-y-2 px-4 py-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <Card size="sm">
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
                No log entries in the Redis hot window
            </CardContent>
        </Card>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Card size="sm">
            <CardContent className="flex flex-col items-center gap-2 py-8 text-sm">
                <p className="text-muted-foreground">Couldn’t load logs</p>
                <button onClick={onRetry} className="text-xs hover:underline">
                    Try again
                </button>
            </CardContent>
        </Card>
    );
}
