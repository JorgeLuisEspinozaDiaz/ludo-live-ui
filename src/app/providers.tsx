import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { SocketProvider } from "@/realtime/SocketProvider";
import { RealtimeBridge } from "@/realtime/RealtimeBridge";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <SocketProvider>
        <RealtimeBridge />
        {children}
        <Toaster richColors position="top-center" />
      </SocketProvider>
    </QueryClientProvider>
  );
}
