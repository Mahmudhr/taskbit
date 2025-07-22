'use client';

import { searchClients } from '@/server/client/client';
import { useCallback, useRef } from 'react';

export type SearchClientOption = {
  label: string;
  value: string;
  user: {
    id: number;
    email?: string | null;
    name: string;
  };
};

export function useClient() {
  // Debounced search function
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPromiseRef = useRef<{
    resolve: ((value: SearchClientOption[]) => void) | null;
    reject: ((reason?: unknown) => void) | null;
  }>({ resolve: null, reject: null });

  const search = useCallback((inputValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (pendingPromiseRef.current.reject) {
        pendingPromiseRef.current.reject('Cancelled');
      }
    }
    return new Promise<SearchClientOption[]>((resolve, reject) => {
      pendingPromiseRef.current = { resolve, reject };
      timeoutRef.current = setTimeout(async () => {
        try {
          const users = await searchClients(inputValue);
          const options: SearchClientOption[] = users.map((user) => ({
            label: user.name,
            value: String(user.id),
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          }));
          resolve(options);
        } catch (e) {
          reject(e);
        }
      }, 300);
    });
  }, []);

  return { searchClients: search };
}
