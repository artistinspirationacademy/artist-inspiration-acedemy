"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cFetch,
    CreateStudent,
    handleClientError,
    ImportMasterResult,
    MasterTable,
    Student,
    UpdateAttendanceMonth,
    UpdateStudent,
    UpdateStudentEnrollment,
} from "@workspace/config";
import { toast } from "sonner";

/**
 * Data layer for the admin Master Table. Mutations are deliberately quiet
 * (no toasts) — the table applies optimistic overrides and rolls back on
 * failure, mirroring the attendance sheet's flush pattern.
 */
export function useMaster() {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["master"] });
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
        queryClient.invalidateQueries({ queryKey: ["student"] });
    };

    const usePaginate = ({
        month,
        search,
        teacherId,
        courseId,
        platformId,
        packageId,
        isActive,
        limit,
        page,
        enabled,
    }: {
        month: string;
        search?: string;
        teacherId?: string;
        courseId?: string;
        platformId?: string;
        packageId?: string;
        isActive?: boolean;
        limit?: number;
        page?: number;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: [
                "master",
                month,
                search,
                teacherId,
                courseId,
                platformId,
                packageId,
                isActive,
                limit,
                page,
            ],
            queryFn: async () => {
                const searchParams = new URLSearchParams({ month });
                if (search) searchParams.append("search", search);
                if (teacherId) searchParams.append("teacherId", teacherId);
                if (courseId) searchParams.append("courseId", courseId);
                if (platformId) searchParams.append("platformId", platformId);
                if (packageId) searchParams.append("packageId", packageId);
                if (isActive !== undefined)
                    searchParams.append("isActive", String(isActive));
                if (limit) searchParams.append("limit", limit.toString());
                if (page) searchParams.append("page", page.toString());

                const res = await cFetch<MasterTable>(
                    `/api/master?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            placeholderData: (prev) => prev,
            refetchOnWindowFocus: false,
            enabled,
        });
    };

    // unlike useStudent().useCreate, this stays on the Master Table after
    // saving — the new row simply appears in place
    const useCreateStudent = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Adding student...");
                return { toastId };
            },
            mutationFn: async (values: CreateStudent) => {
                const res = await cFetch<Student[]>(`/api/students`, {
                    method: "POST",
                    body: JSON.stringify([values]),
                });
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (_, __, { toastId }) => {
                invalidate();
                toast.success("Student added!", { id: toastId });
            },
            onError: handleClientError,
        });
    };

    const useUpdateEnrollment = () => {
        return useMutation({
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateStudentEnrollment;
            }) => {
                const res = await cFetch(`/api/enrollments/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
            },
            onSuccess: invalidate,
            onError: (error) => {
                invalidate();
                handleClientError(error, null);
            },
        });
    };

    const useUpdateStudent = () => {
        return useMutation({
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateStudent;
            }) => {
                const res = await cFetch(`/api/students/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
            },
            onSuccess: invalidate,
            onError: (error) => {
                invalidate();
                handleClientError(error, null);
            },
        });
    };

    const useImport = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Importing...");
                return { toastId };
            },
            mutationFn: async ({
                month,
                rows,
            }: {
                month: string;
                rows: unknown[];
            }) => {
                const res = await cFetch<ImportMasterResult>(
                    "/api/master/import",
                    {
                        method: "POST",
                        body: JSON.stringify({ month, rows }),
                    }
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            onSuccess: (data, _, { toastId }) => {
                invalidate();
                const errors = data.results.filter((r) => r.error).length;
                toast.success(
                    `Import finished — ${data.updated} updated, ${data.created} created` +
                        (errors ? `, ${errors} row(s) skipped` : ""),
                    { id: toastId }
                );
            },
            onError: handleClientError,
        });
    };

    const useUpdateMonth = () => {
        return useMutation({
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateAttendanceMonth;
            }) => {
                const res = await cFetch(`/api/attendance/months/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(values),
                });
                if (!res.ok) throw res.error;
            },
            onSuccess: invalidate,
            onError: (error) => {
                invalidate();
                handleClientError(error, null);
            },
        });
    };

    return {
        usePaginate,
        useCreateStudent,
        useImport,
        useUpdateEnrollment,
        useUpdateStudent,
        useUpdateMonth,
    };
}
