import { AUTH_COOKIE_NAME } from "@/config/const";
import { CResponse, handleError } from "@workspace/config";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE_NAME);

        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
