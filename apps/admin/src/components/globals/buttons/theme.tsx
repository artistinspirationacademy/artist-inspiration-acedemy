"use client";

import { cn, Icons } from "@workspace/config";
import { ButtonHTMLAttributes } from "react";
import { useTheme } from "@wrksz/themes/client";

export function ThemeButton({
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { theme, setTheme } = useTheme();

    return (
        <button
            className={cn(
                "hover:bg-muted rounded-full p-2 transition-all ease-in-out",
                className
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            {...props}
        >
            {theme === "dark" ? (
                <>
                    <Icons.Sun className="size-5" />
                    <span className="sr-only">Light Mode</span>
                </>
            ) : (
                <>
                    <Icons.Moon className="size-5" />
                    <span className="sr-only">Dark Mode</span>
                </>
            )}
        </button>
    );
}
