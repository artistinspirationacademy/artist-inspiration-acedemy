"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { FullBooking, Icons } from "@workspace/config";
import { format } from "date-fns";
import { toast } from "sonner";

interface PageProps {
    booking: FullBooking;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BookingDetailsSheet({
    booking,
    isOpen,
    onOpenChange,
}: PageProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
            >
                <SheetHeader className="border-b p-6">
                    <SheetTitle className="flex items-center gap-2">
                        {booking.name}
                        {booking.isActive ? (
                            <Badge>Active</Badge>
                        ) : (
                            <Badge variant="secondary">Inactive</Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Booking for{" "}
                        <span className="text-foreground font-medium">
                            {booking.course.title}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="space-y-6 p-6">
                        <Section title="Contact">
                            <CopyableRow
                                label="Email"
                                icon={<Icons.Envelope className="size-4" />}
                                value={booking.email}
                            />
                            <CopyableRow
                                label="Phone"
                                icon={<Icons.Phone className="size-4" />}
                                value={booking.phone}
                            />
                            <DetailRow
                                label="Country"
                                icon={<Icons.MapPin className="size-4" />}
                                value={booking.country}
                            />
                        </Section>

                        <Separator />

                        <Section title="About">
                            <DetailRow label="Age" value={booking.age} />
                            <DetailRow label="Gender" value={booking.gender} />
                            <DetailRow
                                label="Experience"
                                value={
                                    <span className="capitalize">
                                        {booking.experienceLevel}
                                    </span>
                                }
                            />
                        </Section>

                        <Separator />

                        <Section title="Course">
                            <DetailRow
                                label="Title"
                                value={
                                    <Badge variant="outline">
                                        {booking.course.title}
                                    </Badge>
                                }
                            />
                            <DetailRow
                                label="Preferred start"
                                icon={<Icons.MapPin className="size-4" />}
                                value={format(
                                    new Date(booking.timestamp),
                                    "PPP"
                                )}
                            />
                        </Section>

                        <Separator />

                        <Section title="Meta">
                            <DetailRow
                                label="Booked at"
                                value={format(
                                    new Date(booking.createdAt),
                                    "PPP p"
                                )}
                            />
                            <DetailRow
                                label="Last updated"
                                value={format(
                                    new Date(booking.updatedAt),
                                    "PPP p"
                                )}
                            />
                            <CopyableRow label="ID" value={booking.id} mono />
                        </Section>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {title}
            </h3>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
                {icon}
                {label}
            </span>
            <span className="text-right">{value}</span>
        </div>
    );
}

function CopyableRow({
    label,
    value,
    icon,
    mono,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    mono?: boolean;
}) {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Couldn't copy ${label.toLowerCase()}`);
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
                {icon}
                {label}
            </span>
            <div className="flex min-w-0 items-center gap-1">
                <span
                    className={
                        mono
                            ? "text-foreground truncate font-mono text-xs"
                            : "text-foreground truncate"
                    }
                    title={value}
                >
                    {value}
                </span>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 shrink-0"
                    onClick={handleCopy}
                    aria-label={`Copy ${label.toLowerCase()}`}
                >
                    <Icons.Copy className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
