import {
    CreateNotification,
    FullNotification,
    fullNotificationSchema,
    Notification,
    notificationSchema,
    NotificationStatus,
    UpdateNotification,
} from "@workspace/config";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../client";
import { notifications } from "../schemas";

class NotificationQuery {
    async scan(params: {
        ids?: string[];
        status?: NotificationStatus;
        bookingId?: string;
        include: "booking";
    }): Promise<FullNotification[]>;

    async scan(params?: {
        ids?: string[];
        status?: NotificationStatus;
        bookingId?: string;
        include?: never;
    }): Promise<Notification[]>;

    async scan({
        ids,
        status,
        bookingId,
        include,
    }: {
        ids?: string[];
        status?: NotificationStatus;
        bookingId?: string;
        include?: "booking";
    } = {}): Promise<Notification[] | FullNotification[]> {
        const where = {
            AND: [
                ...(ids?.length ? [{ id: { in: ids } }] : []),
                ...(status ? [{ status }] : []),
                ...(bookingId ? [{ bookingId }] : []),
            ],
        };

        if (include === "booking") {
            const data = await db.query.notifications.findMany({
                where,
                orderBy: { createdAt: "desc" },
                with: { booking: true },
            });
            return fullNotificationSchema.array().parse(data);
        }

        const data = await db.query.notifications.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        return notificationSchema.array().parse(data);
    }

    async paginate(params: {
        limit?: number;
        page?: number;
        status?: NotificationStatus;
        include: "booking";
    }): Promise<{ data: FullNotification[]; count: number; pages: number }>;

    async paginate(params?: {
        limit?: number;
        page?: number;
        status?: NotificationStatus;
        include?: never;
    }): Promise<{ data: Notification[]; count: number; pages: number }>;

    async paginate({
        limit = 10,
        page = 1,
        status,
        include,
    }: {
        limit?: number;
        page?: number;
        status?: NotificationStatus;
        include?: "booking";
    } = {}) {
        limit = limit < 1 ? 10 : limit;
        page = page < 1 ? 1 : page;

        const where = {
            AND: [...(status ? [{ status }] : [])],
        };

        const extras = {
            count: db
                .$count(
                    notifications,
                    status ? eq(notifications.status, status) : undefined
                )
                .as("notification_count"),
        };

        if (include === "booking") {
            const data = await db.query.notifications.findMany({
                where,
                orderBy: { createdAt: "desc" },
                limit,
                offset: (page - 1) * limit,
                extras,
                with: { booking: true },
            });

            const count = +(data?.[0]?.count || 0);
            const pages = Math.ceil(count / limit);
            return {
                data: fullNotificationSchema.array().parse(data),
                count,
                pages,
            };
        }

        const data = await db.query.notifications.findMany({
            where,
            orderBy: { createdAt: "desc" },
            limit,
            offset: (page - 1) * limit,
            extras,
        });

        const count = +(data?.[0]?.count || 0);
        const pages = Math.ceil(count / limit);
        return {
            data: notificationSchema.array().parse(data),
            count,
            pages,
        };
    }

    async get(params: {
        id: string;
        include: "booking";
    }): Promise<FullNotification | null>;

    async get(params: {
        id: string;
        include?: never;
    }): Promise<Notification | null>;

    async get({
        id,
        include,
    }: {
        id: string;
        include?: "booking";
    }): Promise<Notification | FullNotification | null> {
        if (include === "booking") {
            const data = await db.query.notifications.findFirst({
                where: { id },
                with: { booking: true },
            });
            if (!data) return null;
            return fullNotificationSchema.parse(data);
        }

        const data = await db.query.notifications.findFirst({ where: { id } });
        if (!data) return null;
        return notificationSchema.parse(data);
    }

    async unreadCount(): Promise<number> {
        return db.$count(notifications, eq(notifications.status, "unread"));
    }

    async create(values: CreateNotification[]): Promise<Notification[]> {
        if (!values.length) return [];
        const data = await db.insert(notifications).values(values).returning();
        return notificationSchema.array().parse(data);
    }

    async update({
        id,
        values,
    }: {
        id: string;
        values: UpdateNotification;
    }): Promise<Notification | undefined> {
        const data = await db
            .update(notifications)
            .set({
                status: values.status,
                readAt:
                    values.status === "read" || values.status === "archived"
                        ? new Date()
                        : null,
                archivedAt: values.status === "archived" ? new Date() : null,
                updatedAt: new Date(),
            })
            .where(eq(notifications.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return notificationSchema.parse(data);
    }

    async bulkUpdate({
        ids,
        status,
        scopeStatus,
    }: {
        ids?: string[];
        status: NotificationStatus;
        scopeStatus?: NotificationStatus;
    }): Promise<Notification[]> {
        const now = new Date();

        const conditions = [
            ids?.length ? inArray(notifications.id, ids) : undefined,
            scopeStatus ? eq(notifications.status, scopeStatus) : undefined,
        ].filter(Boolean);

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db
            .update(notifications)
            .set({
                status,
                readAt:
                    status === "read" || status === "archived" ? now : null,
                archivedAt: status === "archived" ? now : null,
                updatedAt: now,
            })
            .where(whereClause)
            .returning();

        return notificationSchema.array().parse(data);
    }

    async delete({ ids }: { ids: string[] }) {
        return db
            .delete(notifications)
            .where(inArray(notifications.id, ids))
            .returning();
    }
}

export const notificationQueries = new NotificationQuery();
