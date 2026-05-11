"use client";

import { cn } from "@workspace/config";
import {
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    type ChangeEvent,
    type Ref,
    type RefObject,
    type TextareaHTMLAttributes,
} from "react";

const OFFSET_BORDER = 6;

interface UseAutosizeTextAreaProps {
    textAreaRef: RefObject<HTMLTextAreaElement | null>;
    minHeight?: number;
    maxHeight?: number;
    triggerAutoSize: string;
}

export function useAutosizeTextArea({
    textAreaRef,
    triggerAutoSize,
    maxHeight = Number.MAX_SAFE_INTEGER,
    minHeight = 0,
}: UseAutosizeTextAreaProps) {
    const initialized = useRef(false);

    useEffect(() => {
        const el = textAreaRef.current;
        if (!el) return;

        if (!initialized.current) {
            el.style.minHeight = `${minHeight + OFFSET_BORDER}px`;
            if (maxHeight > minHeight) el.style.maxHeight = `${maxHeight}px`;
            initialized.current = true;
        }

        el.style.height = `${minHeight + OFFSET_BORDER}px`;
        const scrollHeight = el.scrollHeight;
        el.style.height =
            scrollHeight > maxHeight
                ? `${maxHeight}px`
                : `${scrollHeight + OFFSET_BORDER}px`;
    }, [textAreaRef, triggerAutoSize, minHeight, maxHeight]);
}

export type AutosizeTextAreaRef = {
    textArea: HTMLTextAreaElement;
    maxHeight: number;
    minHeight: number;
};

export type AutosizeTextAreaProps = {
    maxHeight?: number;
    minHeight?: number;
    ref?: Ref<AutosizeTextAreaRef>;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutosizeTextarea({
    maxHeight = Number.MAX_SAFE_INTEGER,
    minHeight = 52,
    className,
    onChange,
    value,
    defaultValue,
    ref,
    ...props
}: AutosizeTextAreaProps) {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const triggerAutoSize =
        typeof value === "string"
            ? value
            : typeof defaultValue === "string"
              ? defaultValue
              : "";

    useAutosizeTextArea({
        textAreaRef,
        triggerAutoSize,
        maxHeight,
        minHeight,
    });

    useImperativeHandle(ref, () => ({
        textArea: textAreaRef.current as HTMLTextAreaElement,
        maxHeight,
        minHeight,
    }));

    const resize = useCallback(
        (el: HTMLTextAreaElement) => {
            el.style.height = `${minHeight + OFFSET_BORDER}px`;
            const scrollHeight = el.scrollHeight;
            el.style.height =
                scrollHeight > maxHeight
                    ? `${maxHeight}px`
                    : `${scrollHeight + OFFSET_BORDER}px`;
        },
        [minHeight, maxHeight]
    );

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        resize(e.target);
        onChange?.(e);
    };

    return (
        <textarea
            {...props}
            value={value}
            defaultValue={defaultValue}
            ref={textAreaRef}
            className={cn(
                "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-lg border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive resize-none",
                className
            )}
            onChange={handleChange}
        />
    );
}
