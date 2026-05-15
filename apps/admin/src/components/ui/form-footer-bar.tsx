"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@workspace/config";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface FormFooterBarProps {
    visible: boolean;
    isSubmitting?: boolean;
    onCancel?: () => void;
    cancelLabel?: string;
    saveLabel?: string;
    savingLabel?: string;
    saveDisabled?: boolean;
    message?: string;
    /** "submit" wires to the surrounding <form>; "button" calls onSave. */
    saveType?: "submit" | "button";
    onSave?: () => void;
    /** Hide the cancel button entirely. */
    hideCancel?: boolean;
}

export function FormFooterBar({
    visible,
    isSubmitting = false,
    onCancel,
    cancelLabel = "Cancel",
    saveLabel = "Save",
    savingLabel = "Saving...",
    saveDisabled = false,
    message = "You have unsaved changes",
    saveType = "submit",
    onSave,
    hideCancel = false,
}: FormFooterBarProps) {
    const [isFloating, setIsFloating] = useState(true);

    useEffect(() => {
        if (!visible) return;

        const compute = () => {
            const docHeight = document.documentElement.scrollHeight;
            const viewportBottom = window.innerHeight + window.scrollY;
            // 32px buffer accommodates the bottom-4 sticky offset + the bar
            // settling into its natural document position at the end.
            setIsFloating(viewportBottom < docHeight - 32);
        };
        compute();

        window.addEventListener("scroll", compute, { passive: true });
        window.addEventListener("resize", compute);
        return () => {
            window.removeEventListener("scroll", compute);
            window.removeEventListener("resize", compute);
        };
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 24, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="sticky bottom-4 z-30 mt-6"
                >
                    <div
                        className={cn(
                            "flex items-center justify-between gap-3 rounded-xl px-4 py-3",
                            "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
                            isFloating
                                ? "border-border bg-card/90 border shadow-lg backdrop-blur-md"
                                : "border border-transparent bg-transparent shadow-none"
                        )}
                    >
                        <motion.p
                            animate={{
                                opacity: isFloating ? 1 : 0,
                                x: isFloating ? 0 : -8,
                            }}
                            transition={{ duration: 0.2 }}
                            className="text-foreground/90 truncate text-sm font-medium"
                            aria-live="polite"
                        >
                            {message}
                        </motion.p>

                        <div className="flex shrink-0 items-center gap-2">
                            {!hideCancel && onCancel && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={isSubmitting}
                                    onClick={onCancel}
                                >
                                    {cancelLabel}
                                </Button>
                            )}

                            <Button
                                type={saveType}
                                disabled={isSubmitting || saveDisabled}
                                onClick={
                                    saveType === "button" ? onSave : undefined
                                }
                            >
                                {isSubmitting ? savingLabel : saveLabel}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
