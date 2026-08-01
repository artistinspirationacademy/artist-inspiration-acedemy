"use client";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    cn,
    formatMonthKey,
    Icons,
    isMonthKey,
    monthKey,
    parseMonthKey,
} from "@workspace/config";
import { useState } from "react";

const MONTHS = Array.from({ length: 12 }, (_, index) =>
    new Date(2000, index, 1).toLocaleDateString("en-US", { month: "short" })
);

interface MonthPickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    align?: "start" | "center" | "end";
}

export function MonthPicker({
    value,
    onChange,
    disabled,
    placeholder = "Pick a month",
    className,
    align = "start",
}: MonthPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isValid = isMonthKey(value);

    const [year, setYear] = useState(() =>
        isValid ? parseMonthKey(value).year : new Date().getFullYear()
    );
    const [committed, setCommitted] = useState(value);

    if (committed !== value) {
        setCommitted(value);
        if (isValid) setYear(parseMonthKey(value).year);
    }

    const currentMonth = monthKey();
    const selected = isValid ? parseMonthKey(value) : null;

    const select = (next: string) => {
        onChange(next);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start font-normal",
                        !isValid && "text-muted-foreground",
                        className
                    )}
                >
                    <Icons.CalendarBlank className="size-4 shrink-0" />
                    <span className="truncate">
                        {isValid ? formatMonthKey(value) : placeholder}
                    </span>
                    <Icons.CaretUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent align={align} className="w-60 p-3">
                <div className="flex items-center justify-between gap-2">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => setYear((prev) => prev - 1)}
                    >
                        <Icons.CaretLeft className="size-4" />
                        <span className="sr-only">Previous year</span>
                    </Button>

                    <p className="text-sm font-medium tabular-nums">{year}</p>

                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => setYear((prev) => prev + 1)}
                    >
                        <Icons.CaretRight className="size-4" />
                        <span className="sr-only">Next year</span>
                    </Button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1">
                    {MONTHS.map((label, index) => {
                        const month = index + 1;
                        const key = `${year}-${String(month).padStart(2, "0")}`;
                        const isSelected =
                            selected?.year === year && selected.month === month;

                        return (
                            <Button
                                key={label}
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "ghost"}
                                className={cn(
                                    "h-8",
                                    !isSelected &&
                                        key === currentMonth &&
                                        "ring-ring ring-1"
                                )}
                                onClick={() => select(key)}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground mt-2 w-full"
                    onClick={() => select(currentMonth)}
                >
                    This month
                </Button>
            </PopoverContent>
        </Popover>
    );
}
