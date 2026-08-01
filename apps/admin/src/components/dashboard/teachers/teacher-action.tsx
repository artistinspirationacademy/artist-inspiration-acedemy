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
import {
    DEFAULT_PAGINATION,
    Icons,
    TeacherWithAccount,
} from "@workspace/config";
import { useFacultyAccount, useTeacher } from "@workspace/rq";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import {
    TeacherAccountDialog,
    type AccountDialogMode,
} from "./teacher-account-dialog";

interface PageProps {
    data: TeacherWithAccount;
    onDelete?: (id: string) => void;
}

export function TeacherAction({ data, onDelete }: PageProps) {
    const router = useRouter();
    const account = data.account;

    const [page] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.PAGE)
    );
    const [limit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION.GENERAL.LIMIT)
    );
    const [search] = useQueryState("search", { defaultValue: "" });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [accountDialogMode, setAccountDialogMode] =
        useState<AccountDialogMode | null>(null);

    const { usePaginate, useDelete } = useTeacher();
    const { refetch } = usePaginate({ limit, page, search });
    const { mutateAsync, isPending } = useDelete();

    const { useUpdate: useUpdateAccount, useDelete: useDeleteAccount } =
        useFacultyAccount();
    const { mutateAsync: updateAccount, isPending: isUpdatingAccount } =
        useUpdateAccount();
    const { mutateAsync: revokeAccount, isPending: isRevoking } =
        useDeleteAccount();

    const isAccountBusy = isUpdatingAccount || isRevoking;

    const handleDelete = async () => {
        await mutateAsync({ ids: [data.id] });
        setIsDeleteModalOpen(false);
        onDelete?.(data.id);
        refetch();
    };

    const handleRevoke = async () => {
        await revokeAccount({ teacherId: data.id });
        setIsRevokeModalOpen(false);
        refetch();
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
                                router.push(`/teachers/${data.id}/edit`)
                            }
                        >
                            <Icons.PencilSimple className="size-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() =>
                                router.push(`/attendance?teacherId=${data.id}`)
                            }
                        >
                            <Icons.CalendarCheck className="size-4" />
                            <span>View Attendance</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Faculty Account</DropdownMenuLabel>

                    <DropdownMenuGroup>
                        {!account ? (
                            <DropdownMenuItem
                                onClick={() => setAccountDialogMode("create")}
                            >
                                <Icons.UserPlus className="size-4" />
                                <span>Create Account</span>
                            </DropdownMenuItem>
                        ) : (
                            <>
                                {account.status === "active" && (
                                    <DropdownMenuItem
                                        disabled={isAccountBusy}
                                        onClick={() =>
                                            setAccountDialogMode("password")
                                        }
                                    >
                                        <Icons.Key className="size-4" />
                                        <span>Set New Password</span>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                    disabled={isAccountBusy}
                                    onClick={() =>
                                        setAccountDialogMode("email")
                                    }
                                >
                                    <Icons.Envelope className="size-4" />
                                    <span>Change Email</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    disabled={isAccountBusy}
                                    onClick={() =>
                                        updateAccount({
                                            teacherId: data.id,
                                            values: {
                                                isActive: !account.isActive,
                                            },
                                        })
                                    }
                                >
                                    {account.isActive ? (
                                        <>
                                            <Icons.Prohibit className="size-4" />
                                            <span>Disable Account</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Check className="size-4" />
                                            <span>Enable Account</span>
                                        </>
                                    )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    disabled={isAccountBusy}
                                    onClick={() => setIsRevokeModalOpen(true)}
                                >
                                    <Icons.Prohibit className="size-4" />
                                    <span>Revoke Account</span>
                                </DropdownMenuItem>
                            </>
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

            {accountDialogMode && (
                <TeacherAccountDialog
                    data={data}
                    mode={accountDialogMode}
                    isOpen
                    onOpenChange={(isOpen) =>
                        setAccountDialogMode(isOpen ? accountDialogMode : null)
                    }
                />
            )}

            <AlertDialog
                open={isRevokeModalOpen}
                onOpenChange={setIsRevokeModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Revoke the faculty account of &ldquo;
                            {data.name}&rdquo;?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            They lose access to the faculty portal immediately.
                            Their students and attendance history are kept, and
                            a new account can be created later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsRevokeModalOpen(false)}
                            disabled={isRevoking}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleRevoke}
                            disabled={isRevoking}
                        >
                            Revoke
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                            Deleting this teacher will permanently remove them,
                            their faculty account, their student enrollments and
                            every attendance sheet tied to them. This action
                            cannot be undone.
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
