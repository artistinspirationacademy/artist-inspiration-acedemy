import { auth } from "@/lib/jwt";
import { MEDIA_FILE_ACCEPT } from "@workspace/config";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter: FileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "16MB", maxFileCount: 20 },
        video: { maxFileSize: "256MB", maxFileCount: 10 },
        audio: { maxFileSize: "64MB", maxFileCount: 20 },
        pdf: { maxFileSize: "32MB", maxFileCount: 20 },
        blob: { maxFileSize: "32MB", maxFileCount: 20 },
    })
        .middleware(async ({ files }) => {
            const isAuth = await auth();
            if (!isAuth?.user)
                throw new UploadThingError("Unauthorized");

            const invalid = files.find(
                (file) =>
                    !MEDIA_FILE_ACCEPT.includes(
                        file.type.toLowerCase() as (typeof MEDIA_FILE_ACCEPT)[number]
                    )
            );
            if (invalid)
                throw new UploadThingError(
                    `Unsupported file type: ${invalid.type}`
                );

            return { userId: isAuth.user.id };
        })
        .onUploadComplete(async ({ file }) => {
            return {
                key: file.key,
                name: file.name,
                size: file.size,
                type: file.type,
                ufsUrl: file.ufsUrl,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
