import { SafeUser, safeUserSchema, User } from "@workspace/config";
import { db } from "../client";

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
}

export const userQueries = new UserQuery();
