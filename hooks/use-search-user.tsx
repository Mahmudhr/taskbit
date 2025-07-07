import { useCallback, useRef } from 'react';
import { searchUsers } from '../server/user/user';

export type SearchUserOption = {
  label: string;
  value: string;
  user: any;
};

export function useSearchUser() {
  // Debounced search function
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPromiseRef = useRef<{
    resolve: ((value: any) => void) | null;
    reject: ((reason?: any) => void) | null;
  }>({ resolve: null, reject: null });

  const search = useCallback((inputValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (pendingPromiseRef.current.reject) {
        pendingPromiseRef.current.reject('Cancelled');
      }
    }
    return new Promise<any[]>((resolve, reject) => {
      pendingPromiseRef.current = { resolve, reject };
      timeoutRef.current = setTimeout(async () => {
        try {
          const users = await searchUsers(inputValue);
          resolve(users);
        } catch (e) {
          reject(e);
        }
      }, 300);
    });
  }, []);

  return { search };
}
