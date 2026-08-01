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
import { FullStudent, Icons, monthKey } from "@workspace/config";
import { useStudent } from "@workspace/rq";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PageProps {
    data: FullStudent;
    onDelete?: (id: string) => void;
}

export function StudentAction({ data, onDelete }: PageProps) {
    const router = useRouter();
    const firstEnrollment = data.enrollments[0];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { useDelete } = useStudent();
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

                <DropdownMenuContent align="end" className="w-auto">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(`/students/${data.id}/edit`)
                            }
                        >
                            <Icons.PencilSimple className="size-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>

                        {firstEnrollment && (
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/attendance?teacherId=${firstEnrollment.teacherId}&month=${monthKey()}`
                                    )
                                }
                            >
                                <Icons.CalendarCheck className="size-4" />
                                <span>Open Attendance</span>
                            </DropdownMenuItem>
                        )}
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
                            Deleting this student will permanently remove them,
                            their enrollments and every attendance record for
                            them. This action cannot be undone. To keep the
                            history, deactivate them instead.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
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
