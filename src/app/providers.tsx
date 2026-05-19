import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {children}
          <Toaster richColors position="bottom-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
