"use client";

import { MediaEditForm } from "@/components/globals/forms";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    DEFAULT_PAGINATION,
    Icons,
    Media,
    MEDIA_TYPES,
} from "@workspace/config";
import { useMedia } from "@workspace/rq";
import {
    parseAsArrayOf,
    parseAsInteger,
    parseAsStringLiteral,
    useQueryState,
} from "nuqs";
import { useState } from "react";

interface PageProps {
    data: Media;
    onDelete?: (id: string) => void;
}

export function MediaAction({ data, onDelete }: PageProps) {
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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { usePaginate, useDelete } = useMedia();
    const { refetch } = usePaginate({
        limit,
        page,
        search,
        types: types ?? undefined,
    });

    const { mutateAsync, isPending } = useDelete();

    const handleDelete = async () => {
        await mutateAsync({ ids: [data.id] });
        setIsDeleteModalOpen(false);
        onDelete?.(data.id);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8">
                        <span className="sr-only">Open menu</span>
                        <Icons.DotsThreeVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <Icons.PencilSimple className="size-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        <Icons.Trash className="size-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="w-full">
                    <DialogHeader>
                        <DialogTitle>Edit Media</DialogTitle>
                        <DialogDescription>
                            Update media information
                        </DialogDescription>
                    </DialogHeader>

                    <MediaEditForm
                        data={data}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={() => {
                            setIsEditModalOpen(false);
                            refetch();
                        }}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete &ldquo;
                            {data.name}&rdquo;?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Deleting this media item will permanently remove
                            both the file and its database record. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
