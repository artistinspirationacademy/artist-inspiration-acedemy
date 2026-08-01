"use client";

import {
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type OnChangeFn,
    type RowSelectionState,
    type TableOptions,
    type Table as TableType,
} from "@tanstack/react-table";
import { createContext, use, useMemo, type PropsWithChildren } from "react";

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    isLoading?: boolean;
    pageSize?: number;
    manualPagination?: boolean;
    enableRowSelection?: boolean;
    state?: Partial<{
        pagination: {
            pageIndex: number;
            pageSize: number;
        };
        rowSelection: RowSelectionState;
        columnVisibility: Record<string, boolean>;
        columnFilters: ColumnFiltersState;
        globalFilter: string;
    }>;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    getRowId?: (row: TData) => string;
    tableOptions?: Partial<TableOptions<TData>>;
};

type DataTableContextType<TData> = {
    table: TableType<TData>;
};

const DataTableContext = createContext<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataTableContextType<any> | undefined
>(undefined);

export function useDataTable<TData>() {
    const context = use(DataTableContext);
    if (!context)
        throw new Error("useDataTable must be used within a DataTableProvider");

    return context as DataTableContextType<TData>;
}

function Root<TData, TValue>({
    columns,
    data,
    pageCount,
    manualPagination = false,
    enableRowSelection = false,
    state,
    onRowSelectionChange,
    getRowId,
    tableOptions,
    children,
}: PropsWithChildren<DataTableProps<TData, TValue>>) {
    "use no memo";

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is opted out via the "use no memo" directive above.
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination,
        pageCount,
        enableRowSelection,
        onRowSelectionChange,
        getRowId,
        ...tableOptions,
        state: {
            ...state,
        },
        enableMultiRowSelection: true,
    });

    const contextValue = useMemo(() => ({ table }), [table]);

    return (
        <DataTableContext value={contextValue}>
            <div className="space-y-4">{children}</div>
        </DataTableContext>
    );
}

export const DataTable = {
    Root,
};
