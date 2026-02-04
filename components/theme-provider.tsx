'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import MaintenancePage from './maintenance';

const queryClient = new QueryClient();

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {process.env.NEXT_PUBLIC_MAINTENANCE_NOT_MODE !== 'true' ? (
            <MaintenancePage />
          ) : (
            children
          )}
        </QueryClientProvider>
      </SessionProvider>
    </NextThemesProvider>
  );
}
