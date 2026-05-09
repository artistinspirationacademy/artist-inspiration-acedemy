import type { ReactNode } from "react";

interface HeaderProps {
    children: ReactNode;
    className?: string;
}

export function Header({ children, className = "" }: HeaderProps) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
}
