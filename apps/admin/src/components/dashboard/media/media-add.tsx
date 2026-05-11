"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    DEFAULT_PAGINATION,
    Icons,
    MEDIA_FILE_ACCEPT,
    MEDIA_TYPES,
} from "@workspace/config";
import { useMedia } from "@workspace/rq";
import {
    parseAsArrayOf,
    parseAsInteger,
    parseAsStringLiteral,
    useQueryState,
} from "nuqs";
import { ChangeEvent, useRef } from "react";

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

    const { usePaginate, useCreate } = useMedia();

    const { mutateAsync: uploadMedia, isPending: isUploading } = useCreate();
    const { refetch } = usePaginate({
        limit,
        page,
        search,
        types: types ?? undefined,
    });

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        await uploadMedia({ files: Array.from(files) });
        fileInputRef.current.value = "";
        refetch();
    };

    return (
        <>
            <Button
                size="sm"
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
