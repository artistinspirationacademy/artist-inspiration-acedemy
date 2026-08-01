"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AttendanceSheet,
    AttendanceSummary,
    cFetch,
    FacultyAttendanceSheet,
    FacultyAttendanceSummary,
    handleClientError,
    MarkAttendance,
    UpdateAttendanceMonth,
} from "@workspace/config";
import { toast } from "sonner";

/**
 * `teacherId` is only honoured by the admin API — the faculty API always scopes
 * the sheet to the signed-in teacher and ignores it.
 */
export function useAttendance() {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["attendance"] });

    const useSheet = <
        T extends AttendanceSheet | FacultyAttendanceSheet = AttendanceSheet,
    >({
        month,
        teacherId,
        page,
        limit,
        enabled,
    }: {
        month: string;
        teacherId?: string;
        page?: number;
        limit?: number;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["attendance", "sheet", month, teacherId, page, limit],
            queryFn: async () => {
                const searchParams = new URLSearchParams({ month });
                if (teacherId) searchParams.append("teacherId", teacherId);
                if (page) searchParams.append("page", page.toString());
                if (limit) searchParams.append("limit", limit.toString());

                const res = await cFetch<T>(
                    `/api/attendance/sheet?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            placeholderData: (prev) => prev,
            enabled,
            refetchOnWindowFocus: false,
        });
    };

    const useSummary = <
        T extends AttendanceSummary | FacultyAttendanceSummary =
            AttendanceSummary,
    >({
        month,
        teacherId,
        enabled,
    }: {
        month: string;
        teacherId?: string;
        enabled?: boolean;
    }) => {
        return useQuery({
            queryKey: ["attendance", "summary", month, teacherId],
            queryFn: async () => {
                const searchParams = new URLSearchParams({ month });
                if (teacherId) searchParams.append("teacherId", teacherId);

                const res = await cFetch<T>(
                    `/api/attendance/summary?${searchParams.toString()}`
                );
                if (!res.ok) throw res.error;
                return res.data;
            },
            enabled,
            refetchOnWindowFocus: false,
        });
    };

    const useMarkDays = () => {
        return useMutation({
            mutationFn: async ({ values }: { values: MarkAttendance }) => {
                const res = await cFetch(`/api/attendance/days`, {
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

    const useSync = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Syncing the month...");
                return { toastId };
            },
            mutationFn: async ({
                month,
                teacherId,
            }: {
                month: string;
                teacherId: string;
            }) => {
                const res = await cFetch(`/api/attendance/sync`, {
                    method: "POST",
                    body: JSON.stringify({ month, teacherId }),
                });
                if (!res.ok) throw res.error;
            },
            onSuccess: (_, __, { toastId }) => {
                invalidate();
                toast.success("Month synced with the current enrollments", {
                    id: toastId,
                });
            },
            onError: handleClientError,
        });
    };

    return { useSheet, useSummary, useMarkDays, useUpdateMonth, useSync };
}
