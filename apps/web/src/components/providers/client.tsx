"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "../ui/tooltip";

export function ClientProvider({ children }: RootLayoutProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster richColors />
            </NuqsAdapter>

            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}
