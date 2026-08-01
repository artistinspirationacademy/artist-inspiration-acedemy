import { AUTH_COOKIE_NAME } from "@/config/const";
import { auth } from "@/lib/jwt";
import { cache } from "@workspace/cache";
import { CResponse, handleError } from "@workspace/config";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const isAuth = await auth();

        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE_NAME);

        await cache.logs.add({
            type: "auth",
            message: "Faculty signed out",
            actorId: isAuth?.user.id,
        });
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
