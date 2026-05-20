"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { uploadMediaFiles } from "@/lib/uploadthing/client";
import {
    DEFAULT_PAGINATION,
    handleClientError,
    Icons,
    MEDIA_FILE_ACCEPT,
    MEDIA_TYPES,
    reportMediaRejections,
    UploadedMedia,
    validateMediaFiles,
} from "@workspace/config";
import { useMedia } from "@workspace/rq";
import {
    parseAsArrayOf,
    parseAsInteger,
    parseAsStringLiteral,
    useQueryState,
} from "nuqs";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

export function MediaAddButton() {
    const [page] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search] = useQueryState("search", { defaultValue: "" });
    const [types] = useQueryState(
        "types",
        parseAsArrayOf(parseAsStringLiteral(MEDIA_TYPES))
    );

    const fileInputRef = useRef<HTMLInputElement>(null!);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    const { usePaginate, useCreate } = useMedia();

    const { mutateAsync: saveMedia, isPending: isSaving } = useCreate();
    const { refetch } = usePaginate({
        limit,
        page,
        search,
        types: types ?? undefined,
    });

    const isUploading = isUploadingFiles || isSaving;

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        const { accepted, rejected } = validateMediaFiles(Array.from(files));
        reportMediaRejections(rejected);

        if (accepted.length === 0) {
            fileInputRef.current.value = "";
            return;
        }

        const toastId = toast.loading(
            "Uploading media, please DO NOT refresh or leave the page..."
        );

        setIsUploadingFiles(true);
        let uploaded: UploadedMedia[];
        try {
            uploaded = await uploadMediaFiles(accepted);
        } catch (err) {
            toast.dismiss(toastId);
            handleClientError(err, undefined);
            setIsUploadingFiles(false);
            fileInputRef.current.value = "";
            return;
        }
        setIsUploadingFiles(false);
        toast.dismiss(toastId);

        try {
            await saveMedia({ files: uploaded });
        } finally {
            fileInputRef.current.value = "";
            refetch();
        }
    };

    return (
        <>
            <Button
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
            >
                {isUploading ? (
                    <>
                        <Spinner />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Icons.Upload />
                        Upload Media
                    </>
                )}
            </Button>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={MEDIA_FILE_ACCEPT.join(",")}
                onChange={handleUpload}
                className="hidden"
            />
        </>
    );
}
