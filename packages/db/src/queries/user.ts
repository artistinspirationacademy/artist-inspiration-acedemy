import {
    SafeUser,
    safeUserSchema,
    UpdateProfile,
    User,
} from "@workspace/config";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { users } from "../schemas";

class UserQuery {
    async get({
        id,
        email,
        safeParse,
    }: {
        id?: string;
        email?: string;
        safeParse?: true;
    }): Promise<SafeUser | null>;

    async get({
        id,
        email,
        safeParse,
    }: {
        id?: string;
        email?: string;
        safeParse?: false;
    }): Promise<User | null>;

    async get({
        id,
        email,
        safeParse,
    }: {
        id?: string;
        email?: string;
        safeParse?: boolean;
    }): Promise<User | SafeUser | null> {
        if (!id && !email)
            throw new Error("Either 'id' or 'email' must be provided");

        if (safeParse === undefined) safeParse = true;

        const data = await db.query.users.findFirst({
            where: {
                OR: [...(id ? [{ id }] : []), ...(email ? [{ email }] : [])],
            },
        });
        if (!data) return null;

        const parsed = safeParse ? safeUserSchema.parse(data) : data;
        return parsed;
    }

    async updateProfile({ id, values }: { id: string; values: UpdateProfile }) {
        const data = await db
            .update(users)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async updateEmail({ id, email }: { id: string; email: string }) {
        const data = await db
            .update(users)
            .set({ email, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async updatePassword({
        id,
        passwordHash,
    }: {
        id: string;
        passwordHash: string;
    }) {
        const data = await db
            .update(users)
            .set({ password: passwordHash, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

export const userQueries = new UserQuery();
