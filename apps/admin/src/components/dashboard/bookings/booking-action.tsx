"use client";

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FullBooking, Icons } from "@workspace/config";
import { useBooking } from "@workspace/rq";
import { useState } from "react";
import { BookingDetailsSheet } from "./booking-details-sheet";

interface PageProps {
    data: FullBooking;
    onDelete?: (id: string) => void;
}

export function BookingAction({ data, onDelete }: PageProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { useUpdate, useDelete } = useBooking();
    const { mutateAsync: updateAsync, isPending: isUpdating } = useUpdate();
    const { mutateAsync: deleteAsync, isPending: isDeleting } = useDelete();

    const handleToggleActive = async () => {
        await updateAsync({
            id: data.id,
            values: { isActive: !data.isActive },
        });
    };

    const handleDelete = async () => {
        await deleteAsync({ ids: [data.id] });
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
                            onClick={() => setIsDetailsOpen(true)}
                        >
                            <Icons.Eye className="size-4" />
                            <span>View details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleToggleActive}
                            disabled={isUpdating}
                        >
                            <Icons.Check className="size-4" />
                            <span>
                                {data.isActive
                                    ? "Mark as inactive"
                                    : "Mark as done"}
                            </span>
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

            <BookingDetailsSheet
                booking={data}
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />

            <AlertDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete &ldquo;
                            {data.name}&rdquo;&rsquo;s booking?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Deleting this booking will permanently remove it and
                            all associated details. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
