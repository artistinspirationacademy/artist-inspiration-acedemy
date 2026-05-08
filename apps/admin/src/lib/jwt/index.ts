import { AUTH_COOKIE_NAME } from "@/config/const";
import { env } from "@/env";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ["HS256"],
        });
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

export async function auth() {
    const cookieStore = await cookies();

    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const user = await verifyToken(token);
    return { user };
}
