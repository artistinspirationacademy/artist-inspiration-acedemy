"use client";
"use no memo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "@phosphor-icons/react";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { useDataTable } from "./data-table";
import { DataTableViewOptions } from "./view-options";

interface DataTableToolbarProps {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    children?: ReactNode;
    filters?: ReactNode[];
    bulkActions?: ReactNode;
    searchDebounce?: number;
    disableSearch?: boolean;
}

export function DataTableToolbar({
    searchPlaceholder = "Search...",
    searchValue = "",
    onSearchChange,
    children,
    filters,
    bulkActions,
    searchDebounce = 500,
    disableSearch = false,
}: DataTableToolbarProps) {
    const { table } = useDataTable();
    const isFiltered = table.getState().columnFilters.length > 0;

    const [localSearchValue, setLocalSearchValue] = useState(searchValue);
    const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
    if (searchValue !== prevSearchValue) {
        setPrevSearchValue(searchValue);
        setLocalSearchValue(searchValue);
    }

    useEffect(() => {
        if (localSearchValue === searchValue) return;
        const handler = setTimeout(() => {
            onSearchChange?.(localSearchValue);
        }, searchDebounce);

        return () => clearTimeout(handler);
    }, [localSearchValue, onSearchChange, searchDebounce, searchValue]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {!disableSearch && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={localSearchValue}
                        onChange={(event) =>
                            setLocalSearchValue(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                onSearchChange?.(localSearchValue);
                            }
                        }}
                        className="h-8 w-37.5 lg:w-62.5"
                    />
                )}

                {filters && filters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map((filter, index) => (
                            <Fragment key={index}>{filter}</Fragment>
                        ))}
                    </div>
                )}

                {children}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <XIcon />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {bulkActions}
                <DataTableViewOptions />
            </div>
        </div>
    );
}
