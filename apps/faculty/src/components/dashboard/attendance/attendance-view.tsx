"use client";

import { monthKey } from "@workspace/config";
import { parseAsString, useQueryState } from "nuqs";
import { AttendanceSheet } from "./attendance-sheet";

export function AttendanceView() {
    const [month, setMonth] = useQueryState(
        "month",
        parseAsString.withDefault(monthKey())
    );

    return (
        <AttendanceSheet
            month={month}
            onMonthChange={(next) => setMonth(next)}
        />
    );
}
