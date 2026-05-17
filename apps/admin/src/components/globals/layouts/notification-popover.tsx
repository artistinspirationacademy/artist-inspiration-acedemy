"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/ui/empty";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    cn,
    FullNotification,
    Icons,
    NotificationStatus,
} from "@workspace/config";
import { useNotification } from "@workspace/rq";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";

const TABS: { value: NotificationStatus; label: string }[] = [
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "archived", label: "Archived" },
];

export function NotificationPopover({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<NotificationStatus>("unread");

    const { useUnreadCount } = useNotification();
    const { data: unreadCount } = useUnreadCount();

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "hover:bg-muted relative rounded-md p-1",
                        className
                    )}
                    aria-label="Notifications"
                >
                    <Icons.Bell className="size-5" />
                    {unreadCount && unreadCount > 0 ? (
                        <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    ) : null}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-95 p-0"
            >
                <NotificationPanel
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </PopoverContent>
        </Popover>
    );
}

function NotificationPanel({
    activeTab,
    onTabChange,
}: {
    activeTab: NotificationStatus;
    onTabChange: (s: NotificationStatus) => void;
}) {
    const { useBulkUpdate } = useNotification();
    const { mutate: bulkUpdate, isPending: isBulkUpdating } = useBulkUpdate();

    const handleMarkAllRead = () => {
        bulkUpdate({ status: "read", scopeStatus: "unread" });
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b p-3">
                <span className="text-sm font-semibold">Notifications</span>
                {activeTab === "unread" && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={handleMarkAllRead}
                        disabled={isBulkUpdating}
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(v) => onTabChange(v as NotificationStatus)}
                className="gap-0"
            >
                <div className="border-b p-2">
                    <TabsList className="w-full">
                        {TABS.map((t) => (
                            <TabsTrigger key={t.value} value={t.value}>
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {TABS.map((t) => (
                    <NotificationList
                        key={t.value}
                        status={t.value}
                        active={activeTab === t.value}
                    />
                ))}
            </Tabs>
        </div>
    );
}

function NotificationList({
    status,
    active,
}: {
    status: NotificationStatus;
    active: boolean;
}) {
    const { useInfinite } = useNotification();
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfinite({ status, enabled: active });

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!active) return;
        const node = sentinelRef.current;
        const root = scrollRef.current?.querySelector(
            "[data-slot='scroll-area-viewport']"
        ) as HTMLElement | null;
        if (!node || !root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { root, threshold: 1 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [active, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (!active) return null;

    const items = data?.pages.flatMap((p) => p.data) ?? [];

    return (
        <div className="h-105" ref={scrollRef}>
            <ScrollArea className="h-full">
                {isLoading ? (
                    <div className="space-y-2 p-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <NotificationSkeleton key={i} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex h-105 items-center justify-center p-6">
                        <Empty>
                            <Icons.Bell className="size-8 opacity-60" />
                            <p className="text-muted-foreground text-sm">
                                No {status} notifications
                            </p>
                        </Empty>
                    </div>
                ) : (
                    <div className="divide-y">
                        {items.map((n) => (
                            <NotificationRow key={n.id} notification={n} />
                        ))}

                        <div ref={sentinelRef} className="p-2 text-center">
                            {isFetchingNextPage ? (
                                <Icons.Spinner className="text-muted-foreground inline size-4 animate-spin" />
                            ) : !hasNextPage && items.length > 0 ? (
                                <span className="text-muted-foreground text-xs">
                                    You&apos;re all caught up
                                </span>
                            ) : null}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

function NotificationRow({ notification }: { notification: FullNotification }) {
    const { useUpdate, useDelete } = useNotification();
    const { mutate: update, isPending: isUpdating } = useUpdate();
    const { mutate: del, isPending: isDeleting } = useDelete();

    const isUnread = notification.status === "unread";
    const isArchived = notification.status === "archived";

    return (
        <div
            className={cn(
                "hover:bg-muted/40 flex gap-3 p-3 transition-colors",
                isUnread && "bg-muted/20"
            )}
        >
            <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Icons.Book className="size-4" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={cn(
                            "line-clamp-1 text-sm",
                            isUnread ? "font-semibold" : "font-medium"
                        )}
                    >
                        {notification.title}
                    </span>
                    {isUnread && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                </div>

                <p className="text-muted-foreground line-clamp-2 text-xs">
                    {notification.message}
                </p>

                <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[11px]">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                        })}
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-6"
                                disabled={isUpdating || isDeleting}
                            >
                                <Icons.DotsThreeVertical className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isUnread && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        update({
                                            id: notification.id,
                                            status: "read",
                                        })
                                    }
                                >
                                    <Icons.Check className="size-4" />
                                    <span>Mark as read</span>
                                </DropdownMenuItem>
                            )}
                            {!isUnread && !isArchived && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        update({
                                            id: notification.id,
                                            status: "unread",
                                        })
                                    }
                                >
                                    <Icons.ArrowCounterClockwise className="size-4" />
                                    <span>Mark as unread</span>
                                </DropdownMenuItem>
                            )}
                            {!isArchived && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        update({
                                            id: notification.id,
                                            status: "archived",
                                        })
                                    }
                                >
                                    <Icons.Folder className="size-4" />
                                    <span>Archive</span>
                                </DropdownMenuItem>
                            )}
                            {isArchived && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        update({
                                            id: notification.id,
                                            status: "read",
                                        })
                                    }
                                >
                                    <Icons.ArrowCounterClockwise className="size-4" />
                                    <span>Unarchive</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => del({ ids: [notification.id] })}
                            >
                                <Icons.Trash className="size-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

function NotificationSkeleton() {
    return (
        <div className="flex gap-3 p-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    );
}
