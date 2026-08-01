import {
    FacultyAccountStatus,
    FacultyUser,
    facultyUserSchema,
    SafeFacultyUser,
    safeFacultyUserSchema,
} from "@workspace/config";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { facultyUsers } from "../schemas";

export function resolveAccountStatus(account: {
    isActive: boolean;
}): FacultyAccountStatus {
    return account.isActive ? "active" : "disabled";
}

export function toSafeFacultyUser(account: {
    isActive: boolean;
}): SafeFacultyUser {
    return safeFacultyUserSchema.parse({
        ...account,
        status: resolveAccountStatus(account),
    });
}

class FacultyQuery {
    async get(params: {
        id?: string;
        teacherId?: string;
        email?: string;
        safeParse: false;
    }): Promise<FacultyUser | null>;

    async get(params: {
        id?: string;
        teacherId?: string;
        email?: string;
        safeParse?: true;
    }): Promise<SafeFacultyUser | null>;

    async get({
        id,
        teacherId,
        email,
        safeParse = true,
    }: {
        id?: string;
        teacherId?: string;
        email?: string;
        safeParse?: boolean;
    }): Promise<FacultyUser | SafeFacultyUser | null> {
        if (!id && !teacherId && !email)
            throw new Error(
                "Either 'id', 'teacherId' or 'email' must be provided"
            );

        const data = await db.query.facultyUsers.findFirst({
            where: {
                OR: [
                    ...(id ? [{ id }] : []),
                    ...(teacherId ? [{ teacherId }] : []),
                    ...(email ? [{ email }] : []),
                ],
            },
        });
        if (!data) return null;

        return safeParse
            ? toSafeFacultyUser(data)
            : facultyUserSchema.parse(data);
    }

    async scan({
        teacherIds,
    }: {
        teacherIds?: string[];
    } = {}): Promise<SafeFacultyUser[]> {
        const data = await db.query.facultyUsers.findMany({
            where: {
                AND: [
                    ...(teacherIds?.length
                        ? [{ teacherId: { in: teacherIds } }]
                        : []),
                ],
            },
        });

        return data.map(toSafeFacultyUser);
    }

    async create({
        teacherId,
        email,
        passwordHash,
    }: {
        teacherId: string;
        email: string;
        passwordHash: string;
    }): Promise<SafeFacultyUser> {
        const data = await db
            .insert(facultyUsers)
            .values({ teacherId, email, password: passwordHash })
            .returning()
            .then((res) => res[0]!);

        return toSafeFacultyUser(data);
    }

    async update({
        id,
        values,
    }: {
        id: string;
        values: { email?: string; isActive?: boolean };
    }): Promise<SafeFacultyUser | undefined> {
        const data = await db
            .update(facultyUsers)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(facultyUsers.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return toSafeFacultyUser(data);
    }

    async updatePassword({
        id,
        passwordHash,
    }: {
        id: string;
        passwordHash: string | null;
    }): Promise<SafeFacultyUser | undefined> {
        const data = await db
            .update(facultyUsers)
            .set({ password: passwordHash, updatedAt: new Date() })
            .where(eq(facultyUsers.id, id))
            .returning()
            .then((res) => res[0]);

        if (!data) return undefined;
        return toSafeFacultyUser(data);
    }

    async markLogin({ id }: { id: string }) {
        await db
            .update(facultyUsers)
            .set({ lastLoginAt: new Date(), updatedAt: new Date() })
            .where(eq(facultyUsers.id, id));
    }

    async delete({ id }: { id: string }) {
        return db
            .delete(facultyUsers)
            .where(eq(facultyUsers.id, id))
            .returning();
    }
}

export const facultyQueries = new FacultyQuery();
