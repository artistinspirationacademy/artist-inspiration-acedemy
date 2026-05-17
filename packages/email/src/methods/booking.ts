import { cache } from "@workspace/cache";
import { Booking, siteConfig } from "@workspace/config";
import { format } from "date-fns";
import { getResend } from "../client";
import {
    AdminNewBooking,
    BookingConfirmation,
} from "../templates";

export interface BookingEmailContext {
    booking: Booking;
    courseTitle: string;
    teacherName?: string | null;
    adminEmail: string;
    from: string;
    siteUrl: string;
    adminUrl: string;
}

interface BatchEmailItem {
    from: string;
    to: string[];
    subject: string;
    react: React.ReactElement;
    audience: "user" | "admin";
    bookingId: string;
    recipient: string;
}

/**
 * Sends both the user confirmation and admin alert for a batch of bookings
 * via a single Resend batch API call, then logs success or failure per email.
 *
 * Errors never throw — booking creation must remain the source of truth.
 */
export async function sendBookingEmails(
    contexts: BookingEmailContext[]
): Promise<void> {
    if (!contexts.length) return;

    const items: BatchEmailItem[] = [];

    for (const ctx of contexts) {
        const {
            booking,
            courseTitle,
            teacherName,
            adminEmail,
            from,
            siteUrl,
            adminUrl,
        } = ctx;

        const preferredStart = format(
            new Date(booking.timestamp),
            "MMMM d, yyyy"
        );
        const bookedAt = format(
            new Date(booking.createdAt),
            "MMM d, yyyy · h:mm a"
        );

        if (booking.email) {
            items.push({
                from,
                to: [booking.email],
                subject: `We've received your booking — ${courseTitle}`,
                react: BookingConfirmation({
                    name: booking.name,
                    courseTitle,
                    teacherName: teacherName ?? null,
                    preferredStart,
                    siteName: siteConfig.name,
                    siteUrl,
                    contactEmail: siteConfig.contact,
                }),
                audience: "user",
                bookingId: booking.id,
                recipient: booking.email,
            });
        }

        const bookingUrl = `${adminUrl.replace(/\/$/, "")}/bookings?bookingId=${booking.id}`;

        items.push({
            from,
            to: [adminEmail],
            subject: `New booking: ${booking.name} — ${courseTitle}`,
            react: AdminNewBooking({
                bookingId: booking.id,
                name: booking.name,
                email: booking.email,
                phone: booking.phone,
                age: booking.age,
                gender: booking.gender,
                country: booking.country,
                experienceLevel: booking.experienceLevel,
                courseTitle,
                teacherName: teacherName ?? null,
                preferredStart,
                bookedAt,
                bookingUrl,
                siteName: siteConfig.name,
            }),
            audience: "admin",
            bookingId: booking.id,
            recipient: adminEmail,
        });
    }

    if (!items.length) return;

    try {
        const resend = getResend();
        const { data, error } = await resend.batch.send(
            items.map(({ from, to, subject, react }) => ({
                from,
                to,
                subject,
                react,
            })),
            { batchValidation: "permissive" }
        );

        if (error) {
            await Promise.all(
                items.map((item) =>
                    cache.logs.add({
                        type: "booking",
                        level: "error",
                        message: `Failed to send ${item.audience} booking email`,
                        metadata: {
                            bookingId: item.bookingId,
                            audience: item.audience,
                            recipient: item.recipient,
                            error: error.message,
                        },
                    })
                )
            );
            return;
        }

        const failures = new Map<number, string>();
        if (data && "errors" in data && Array.isArray(data.errors)) {
            for (const err of data.errors) {
                failures.set(
                    err.index,
                    err.message ?? "Resend batch error"
                );
            }
        }

        const sent = data?.data ?? [];

        await Promise.all(
            items.map((item, index) => {
                const failureMessage = failures.get(index);
                if (failureMessage) {
                    return cache.logs.add({
                        type: "booking",
                        level: "error",
                        message: `Failed to send ${item.audience} booking email`,
                        metadata: {
                            bookingId: item.bookingId,
                            audience: item.audience,
                            recipient: item.recipient,
                            error: failureMessage,
                        },
                    });
                }
                return cache.logs.add({
                    type: "booking",
                    level: "info",
                    message: `Sent ${item.audience} booking email`,
                    metadata: {
                        bookingId: item.bookingId,
                        audience: item.audience,
                        recipient: item.recipient,
                        emailId: sent[index]?.id ?? null,
                    },
                });
            })
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await Promise.all(
            items.map((item) =>
                cache.logs.add({
                    type: "booking",
                    level: "error",
                    message: `Failed to send ${item.audience} booking email`,
                    metadata: {
                        bookingId: item.bookingId,
                        audience: item.audience,
                        recipient: item.recipient,
                        error: message,
                    },
                })
            )
        );
    }
}
