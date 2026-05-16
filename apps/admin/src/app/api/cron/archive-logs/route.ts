import { env } from "@/env";
import { runArchive } from "@/lib/logs/archive";
import { AppError, CResponse, handleError, MESSAGES } from "@workspace/config";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const auth = req.headers.get("authorization");
        if (auth !== `Bearer ${env.CRON_SECRET}`)
            throw new AppError(
                MESSAGES.ERRORS.GENERAL.UNAUTHORIZED,
                "UNAUTHORIZED"
            );

        const data = await runArchive();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
