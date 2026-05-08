import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./config/const";
import { signToken, verifyToken } from "./lib/jwt";
import { CResponse } from "@workspace/config";

const PUBLIC_PATHS = ["/auth/signin", "/api/auth/signin"];

export async function proxy(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    if (PUBLIC_PATHS.some((path) => url.pathname.startsWith(path)))
        return NextResponse.next();

    if (url.pathname === "/auth")
        return NextResponse.redirect(new URL("/auth/signin", url));

    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (user) {
        if (url.pathname.startsWith("/auth"))
            return NextResponse.redirect(new URL("/", url));

        const res = NextResponse.next();
        const newToken = await signToken(user);

        res.cookies.set(AUTH_COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return res;
    } else {
        if (url.pathname.startsWith("/api")) {
            const response = CResponse({
                message: "UNAUTHORIZED",
                longMessage: "You are not signed in",
            });
            response.cookies.delete(AUTH_COOKIE_NAME);
            return response;
        }

        const response = NextResponse.redirect(new URL("/auth/signin", url));
        response.cookies.delete(AUTH_COOKIE_NAME);
        return response;
    }
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/api/:path*",
        "/",
        "/dashboard/:path*",
        "/auth/:path*",
    ],
};
