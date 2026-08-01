import { cache } from "@workspace/cache";
import { shouldSkipEmailDelivery, siteConfig } from "@workspace/config";
import { getResend } from "../client";
import { FacultyCredentials } from "../templates";

export interface FacultyCredentialsEmailContext {
    teacherName: string;
    email: string;
    password: string;
    facultyUrl: string;
    from: string;
}

export interface FacultyCredentialsEmailResult {
    loginUrl: string;
    delivered: boolean;
}

/**
 * Mails the sign-in credentials for a freshly created account or an
 * admin-set password, and always returns the login URL so callers can surface
 * it when delivery is skipped. Errors never throw — the password is already
 * persisted, so the admin can always set a new one and re-send. The password
 * itself is never logged, only the recipient.
 */
export async function sendFacultyCredentialsEmail({
    teacherName,
    email,
    password,
    facultyUrl,
    from,
}: FacultyCredentialsEmailContext): Promise<FacultyCredentialsEmailResult> {
    const loginUrl = facultyUrl.replace(/\/$/, "");

    if (shouldSkipEmailDelivery()) {
        console.info(
            `[email] skipped faculty credentials to ${email} — login: ${loginUrl}`
        );
        await cache.logs.add({
            type: "faculty",
            message: "Faculty credentials email skipped outside production",
            metadata: { recipient: email, loginUrl },
        });
        return { loginUrl, delivered: false };
    }

    try {
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from,
            to: [email],
            subject: `Your ${siteConfig.name} faculty portal credentials`,
            react: FacultyCredentials({
                teacherName,
                email,
                password,
                loginUrl,
                siteName: siteConfig.name,
                contactEmail: siteConfig.contact,
            }),
        });

        if (error) {
            await cache.logs.add({
                type: "faculty",
                level: "error",
                message: "Failed to send faculty credentials email",
                metadata: { recipient: email, error: error.message },
            });
            return { loginUrl, delivered: false };
        }

        await cache.logs.add({
            type: "faculty",
            message: "Sent faculty credentials email",
            metadata: { recipient: email, emailId: data?.id ?? null },
        });
        return { loginUrl, delivered: true };
    } catch (err) {
        await cache.logs.add({
            type: "faculty",
            level: "error",
            message: "Failed to send faculty credentials email",
            metadata: {
                recipient: email,
                error: err instanceof Error ? err.message : String(err),
            },
        });
        return { loginUrl, delivered: false };
    }
}
