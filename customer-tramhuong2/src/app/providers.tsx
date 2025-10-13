'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        throwOnError: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}