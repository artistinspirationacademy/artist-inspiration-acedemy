import {
    Booking,
    bookingSchema,
    CreateBooking,
    DEFAULT_PAGINATION,
    FullBooking,
    fullBookingSchema,
    UpdateBooking,
} from "@workspace/config";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../client";
import { bookings } from "../schemas";

class BookingQuery {
    async scan(params: {
        ids?: string[];
        courseId?: string;
        email?: string;
        emails?: string[];
        phone?: string;
        phones?: string[];
        isActive?: boolean;
        include: "course";
    }): Promise<FullBooking[]>;

    async scan(params?: {
        ids?: string[];
        courseId?: string;
        email?: string;
        emails?: string[];
        phone?: string;
        phones?: string[];
        isActive?: boolean;
        include?: never;
    }): Promise<Booking[]>;

    async scan({
        ids,
        courseId,
        email,
        emails,
        phone,
        phones,
        isActive,
        include,
    }: {
        ids?: string[];
        courseId?: string;
        email?: string;
        emails?: string[];
        phone?: string;
        phones?: string[];
        isActive?: boolean;
        include?: "course";
    } = {}): Promise<Booking[] | FullBooking[]> {
        const where = {
            AND: [
                ...(ids?.length ? [{ id: { in: ids } }] : []),
                ...(courseId ? [{ courseId }] : []),
                ...(email ? [{ email }] : []),
                ...(emails?.length ? [{ email: { in: emails } }] : []),
                ...(phone ? [{ phone }] : []),
                ...(phones?.length ? [{ phone: { in: phones } }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        if (include === "course") {
            const data = await db.query.bookings.findMany({
                where,
                orderBy: { timestamp: "desc" },
                with: { course: true },
            });
            return fullBookingSchema.array().parse(data);
        }

        const data = await db.query.bookings.findMany({
            where,
            orderBy: { timestamp: "desc" },
        });
        return bookingSchema.array().parse(data);
    }

    async paginate(params: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include: "course";
    }): Promise<{ data: FullBooking[]; count: number; pages: number }>;

    async paginate(params?: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: never;
    }): Promise<{ data: Booking[]; count: number; pages: number }>;

    async paginate({
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
        search,
        courseId,
        isActive,
        include,
    }: {
        limit?: number;
        page?: number;
        search?: string;
        courseId?: string;
        isActive?: boolean;
        include?: "course";
    } = {}) {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const where = {
            AND: [
                ...(search
                    ? [
                          {
                              OR: [
                                  { name: { ilike: `%${search}%` } },
                                  { email: { ilike: `%${search}%` } },
                                  { phone: { ilike: `%${search}%` } },
                              ],
                          },
                      ]
                    : []),
                ...(courseId ? [{ courseId }] : []),
                ...(isActive !== undefined ? [{ isActive }] : []),
            ],
        };

        const extras = {
            count: db
                .$count(
                    bookings,
                    and(
                        search?.length
                            ? or(
                                  ilike(bookings.name, `%${search}%`),
                                  ilike(bookings.email, `%${search}%`),
                                  ilike(bookings.phone, `%${search}%`)
                              )
                            : undefined,
                        courseId ? eq(bookings.courseId, courseId) : undefined,
                        isActive !== undefined
                            ? eq(bookings.isActive, isActive)
                            : undefined
                    )
                )
                .as("booking_count"),
        };

        if (include === "course") {
            const data = await db.query.bookings.findMany({
                where,
                orderBy: { timestamp: "desc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: { course: true },
            });

            const count = +(data?.[0]?.count || 0);
            const pages = Math.ceil(count / limit);
            return {
                data: fullBookingSchema.array().parse(data),
                count,
                pages,
            };
        }

        const data = await db.query.bookings.findMany({
            where,
            orderBy: { timestamp: "desc" },
            limit,
            offset: (page - 1) * limit,
            extras,
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);
        return { data: bookingSchema.array().parse(data), count, pages };
    }

    async get(params: {
        id: string;
        include: "course";
    }): Promise<FullBooking | null>;

    async get(params: {
        id: string;
        include?: never;
    }): Promise<Booking | null>;

    async get({
        id,
        include,
    }: {
        id: string;
        include?: "course";
    }): Promise<Booking | FullBooking | null> {
        if (include === "course") {
            const data = await db.query.bookings.findFirst({
                where: { id },
                with: { course: true },
            });
            if (!data) return null;
            return fullBookingSchema.parse(data);
        }

        const data = await db.query.bookings.findFirst({ where: { id } });
        if (!data) return null;
        return bookingSchema.parse(data);
    }

    async create(values: CreateBooking[]): Promise<Booking[]> {
        const data = await db.insert(bookings).values(values).returning();
        return bookingSchema.array().parse(data);
    }

    async update({
        id,
        values,
    }: {
        id: string;
        values: UpdateBooking;
    }): Promise<Booking | undefined> {
        const data = await db
            .update(bookings)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(bookings.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return bookingSchema.parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db
            .delete(bookings)
            .where(inArray(bookings.id, ids))
            .returning();
    }
}

export const bookingQueries = new BookingQuery();
