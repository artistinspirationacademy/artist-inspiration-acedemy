"use client";

import { useTheme } from "next-themes";
import { SVGProps, useMemo } from "react";

interface FreveoProps extends SVGProps<SVGSVGElement> {
    inverted?: boolean;
    alwaysDark?: boolean;
    alwaysLight?: boolean;
}

export function Freveo({
    width,
    height,
    className,
    fill = "#fff",
    inverted,
    alwaysDark,
    alwaysLight,
    ...props
}: FreveoProps) {
    const { theme } = useTheme();
    const color = useMemo(() => {
        if (alwaysDark) return "#231f20";
        if (alwaysLight) return fill;
        if (inverted) return theme === "dark" ? "#231f20" : fill;

        return theme === "dark" ? fill : "#231f20";
    }, [theme, fill, inverted, alwaysDark, alwaysLight]);

    return (
        <svg
            id="Freveo"
            data-name="Freveo"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
            height={height || 30}
            width={width || 30}
            className={className}
            {...props}
        >
            <path
                fill={color}
                d="M932.49,650.42,543.85,261.78h0a61.75,61.75,0,0,0-87.46,0h0L294.21,423.94h0L67.51,650.64a61.85,61.85,0,0,0,0,87.46h0a61.84,61.84,0,0,0,87.47,0l183-183L521,738.22a61.84,61.84,0,0,0,87.47,0h0a61.85,61.85,0,0,0,0-87.46L425.41,467.68,500.11,393,845,737.88a61.84,61.84,0,0,0,87.47,0h0A61.85,61.85,0,0,0,932.49,650.42Z"
            />
        </svg>
    );
}
