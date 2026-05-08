"use client";

import { cn } from "@workspace/config";
import { ClassValue } from "clsx";

interface ShellProps extends RootLayoutProps {
    classNames?: {
        mainWrapper?: ClassValue;
        innerWrapper?: ClassValue;
    };
}

export function AuthShell({ children, classNames }: ShellProps) {
    return (
        <section
            className={cn(
                "flex min-h-screen items-center justify-center p-6",
                classNames?.mainWrapper
            )}
        >
            <div className={cn("w-full max-w-sm", classNames?.innerWrapper)}>
                {children}
            </div>
        </section>
    );
}
