'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          {children}
        </Layout>
        <Toaster />
        <Sonner 
          position="top-right"
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg, rgb(88 80 236) 0%, rgb(139 92 246) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            classNames: {
              success: 'bg-gradient-to-r from-green-500 to-green-400',
              error: 'bg-gradient-to-r from-red-500 to-red-400',
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}