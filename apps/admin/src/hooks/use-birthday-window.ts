"use client";

import { useEffect, useState } from "react";

const IST_TIME_ZONE = "Asia/Kolkata";
const CHECK_INTERVAL_MS = 30_000;

interface BirthdayWindowOptions {
    month: number;
    day: number;
    birthYear: number;
}

interface BirthdayWindowState {
    isActive: boolean;
    age: number | null;
}

function getISTDateParts() {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: IST_TIME_ZONE,
            year: "numeric",
            month: "numeric",
            day: "numeric",
        }).formatToParts(new Date());

        const read = (type: Intl.DateTimeFormatPartTypes) =>
            Number(parts.find((part) => part.type === type)?.value);

        const year = read("year");
        const month = read("month");
        const day = read("day");

        if ([year, month, day].some(Number.isNaN)) return null;

        return { year, month, day };
    } catch {
        return null;
    }
}

// Dev/QA escape hatch: append `?birthday-preview` to any dashboard URL to
// preview the celebration outside the real window.
function isPreviewForced() {
    return new URLSearchParams(window.location.search).has("birthday-preview");
}

/**
 * Reports whether "today" is the given month/day in IST (Asia/Kolkata),
 * regardless of the visitor's local timezone. Resolves entirely on the
 * client after mount, so it is hydration-safe: the server render and the
 * first client render always see `isActive: false`.
 */
export function useBirthdayWindow({
    month,
    day,
    birthYear,
}: BirthdayWindowOptions): BirthdayWindowState {
    const [state, setState] = useState<BirthdayWindowState>({
        isActive: false,
        age: null,
    });

    useEffect(() => {
        const check = () => {
            const ist = getISTDateParts();

            const isActive =
                (!!ist && ist.month === month && ist.day === day) ||
                isPreviewForced();
            const age = ist ? ist.year - birthYear : null;

            setState((prev) =>
                prev.isActive === isActive && prev.age === age
                    ? prev
                    : { isActive, age }
            );
        };

        check();

        const intervalId = window.setInterval(check, CHECK_INTERVAL_MS);
        document.addEventListener("visibilitychange", check);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", check);
        };
    }, [month, day, birthYear]);

    return state;
}
