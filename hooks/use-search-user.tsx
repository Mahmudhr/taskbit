'use client';

import { useCallback, useRef } from 'react';
import { searchMember, searchUsers } from '../server/user/user';

export type SearchUserOption = {
  label: string;
  value: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
};

export function useSearchUser() {
  // Debounced search function
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPromiseRef = useRef<{
    resolve: ((value: SearchUserOption[]) => void) | null;
    reject: ((reason?: unknown) => void) | null;
  }>({ resolve: null, reject: null });

  const search = useCallback((inputValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (pendingPromiseRef.current.reject) {
        pendingPromiseRef.current.reject('Cancelled');
      }
    }
    return new Promise<SearchUserOption[]>((resolve, reject) => {
      pendingPromiseRef.current = { resolve, reject };
      timeoutRef.current = setTimeout(async () => {
        try {
          const users = await searchUsers(inputValue);
          const options: SearchUserOption[] = users.map((user) => ({
            label: user.name,
            value: user.id,
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

  return { search };
}
export function useSearchMember() {
  // Debounced search function
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPromiseRef = useRef<{
    resolve: ((value: SearchUserOption[]) => void) | null;
    reject: ((reason?: unknown) => void) | null;
  }>({ resolve: null, reject: null });

  const search = useCallback((inputValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (pendingPromiseRef.current.reject) {
        pendingPromiseRef.current.reject('Cancelled');
      }
    }
    return new Promise<SearchUserOption[]>((resolve, reject) => {
      pendingPromiseRef.current = { resolve, reject };
      timeoutRef.current = setTimeout(async () => {
        try {
          const users = await searchMember(inputValue);
          const options: SearchUserOption[] = users.map((user) => ({
            label: user.name,
            value: user.id,
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

  return { search };
}
