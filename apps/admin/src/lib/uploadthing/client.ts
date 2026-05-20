import { genUploader } from "uploadthing/client";
import type { UploadedMedia } from "@workspace/config";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { uploadFiles } = genUploader<OurFileRouter>();

export async function uploadMediaFiles(
    files: File[]
): Promise<UploadedMedia[]> {
    const result = await uploadFiles("mediaUploader", { files });
    return result.map((r, i) => ({
        name: r.name,
        key: r.key,
        size: r.size,
        type: files[i]?.type || r.type,
    }));
}
