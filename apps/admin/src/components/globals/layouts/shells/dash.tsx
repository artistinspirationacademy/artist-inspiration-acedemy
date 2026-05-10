import { cn } from "@workspace/config";
import { ClassValue } from "clsx";

interface ShellProps extends RootLayoutProps {
    classNames?: {
        mainWrapper?: ClassValue;
        innerWrapper?: ClassValue;
    };
}

export function DashShell({ children, classNames }: ShellProps) {
    return (
        <section
            className={cn(
                "flex w-full justify-center",
                classNames?.mainWrapper
            )}
        >
            <div
                className={cn(
                    "w-full max-w-6xl space-y-6 p-6 py-10",
                    classNames?.innerWrapper
                )}
            >
                {children}
            </div>
        </section>
    );
}
