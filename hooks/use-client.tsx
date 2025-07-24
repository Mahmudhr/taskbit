'use client';

import {
  searchClients,
  createClient,
  fetchAllClients,
  updateClient,
  deleteClient,
  fetchClientsSelectOptions,
} from '@/server/client/client';
import { CreateClientType } from '@/server/types/client-type';
import { ClientSelectOption, ClientType, Meta, Response } from '@/types/common';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

export type SearchClientOption = {
  label: string;
  value: number;
  user: {
    id: number;
    email?: string | null;
    name: string;
  };
};

export function useClient(options?: string) {
  const queryClient = useQueryClient();
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

  // const createClientAsync = useCallback(async (data: CreateClientType) => {
  //   return await createClient(data);
  // }, []);

  const fetchClientsQuery = useQuery<Response<ClientType[], Meta>>({
    queryKey: ['clients', options],
    queryFn: async () => {
      const res = await fetchAllClients(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const fetchClientsSelectOptionQuery = useQuery<ClientSelectOption[]>({
    queryKey: ['clients-select-field', options],
    queryFn: async () => {
      const res = await fetchClientsSelectOptions();
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateClientType) => createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateClientType }) =>
      updateClient({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    searchClients: search,
    createUserMutation,
    createClient: createUserMutation.mutate,
    createClientAsync: createUserMutation.mutateAsync,
    fetchClientsQuery,
    fetchAllClients: fetchClientsQuery.data,
    updateClientMutation,
    updateClient: updateClientMutation.mutate,
    updateClientAsync: updateClientMutation.mutateAsync,
    deleteClientMutation,
    deleteClient: deleteClientMutation.mutate,
    deleteClientAsync: deleteClientMutation.mutateAsync,
    fetchClientsSelectOptionQuery,
    fetchClientsSelectOptions: fetchClientsSelectOptionQuery.data,
  };
}
