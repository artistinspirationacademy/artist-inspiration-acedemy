"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, Icons, LogArchive } from "@workspace/config";
import { useLogs } from "@workspace/rq";
import { format } from "date-fns";

export function ArchivesList() {
    const { useArchives, useRunArchive } = useLogs();
    const { data, isPending, isError, refetch } = useArchives({ limit: 50 });
    const { mutateAsync: runArchive, isPending: isRunning } = useRunArchive();

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                    Archives uploaded to UploadThing by the cron job
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runArchive()}
                    disabled={isRunning}
                    className="h-8"
                >
                    <Icons.Upload className="size-3.5" />
                    {isRunning ? "Archiving..." : "Run archive now"}
                </Button>
            </div>

            {isPending ? (
                <ListSkeleton />
            ) : isError ? (
                <Card size="sm">
                    <CardContent className="flex flex-col items-center gap-2 py-8 text-sm">
                        <p className="text-muted-foreground">
                            Couldn’t load archives
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="text-xs hover:underline"
                        >
                            Try again
                        </button>
                    </CardContent>
                </Card>
            ) : !data || data.data.length === 0 ? (
                <Card size="sm">
                    <CardContent className="text-muted-foreground py-10 text-center text-sm">
                        No archives yet — they appear after the cron job
                        offloads aged log buckets to UploadThing.
                    </CardContent>
                </Card>
            ) : (
                <Card size="sm">
                    <CardContent className="px-0">
                        <ul className="divide-y">
                            {data.data.map((a) => (
                                <ArchiveRow key={a.id} archive={a} />
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function ArchiveRow({ archive }: { archive: LogArchive }) {
    return (
        <li className="hover:bg-muted/40 flex items-center justify-between gap-3 px-4 py-3 transition-colors">
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate font-mono text-sm">{archive.name}</p>
                <p className="text-muted-foreground text-[11px]">
                    {format(new Date(archive.periodStart), "MMM d, yyyy")} ·{" "}
                    {archive.entryCount.toLocaleString()} entries ·{" "}
                    {formatFileSize(archive.fileSize)}
                </p>
            </div>
            <a
                href={archive.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-muted text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            >
                <Icons.ArrowRight className="size-3 -rotate-90" />
                Download
            </a>
        </li>
    );
}

function ListSkeleton() {
    return (
        <Card size="sm">
            <CardContent className="space-y-2 px-4 py-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}
