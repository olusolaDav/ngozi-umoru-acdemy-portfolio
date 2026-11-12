"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

import { ConfirmationDialogProvider } from "@/components/ui/confirmation-dialog-provider";
import { WritingAssistanceProvider } from "@/components/writing-assistance-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <WritingAssistanceProvider>
          <ConfirmationDialogProvider>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </ConfirmationDialogProvider>
        </WritingAssistanceProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
