import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  fetchAllUser,
  createUser,
  deleteUser,
  UpdateUser,
  fetchUserById,
  updateUserProfile,
} from '../server/user/user';
import { CreateUserType } from '../server/types/user-type';
import { Meta, NewClientType, Response } from '@/types/common';
import {
  createNewClient,
  fetchAllNewClients,
  updateNewClient,
} from '@/server/client/client';
import { CreateNewClientType } from '@/server/types/client-type';

export function useUser(options?: string) {
  const queryClient = useQueryClient();

  // Fetch users - Now properly typed with the filtered response
  const fetchUsersQuery = useQuery({
    queryKey: ['users', options],
    queryFn: async () => {
      const res = await fetchAllUser(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  // Fetch clients
  const fetchNewClientsQuery = useQuery<Response<NewClientType[], Meta>>({
    queryKey: ['new-clients', options],
    queryFn: async () => {
      const res = await fetchAllNewClients(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserType) => {
      const result = await createUser(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create user');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const createNewClientMutation = useMutation({
    mutationFn: async (data: CreateNewClientType) => {
      const result = await createNewClient(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create user');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['new-clients'] });
    },
  });

  const updateNewClientMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CreateNewClientType;
    }) => {
      const result = await updateNewClient({ id, data });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['new-clients'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['new-clients'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateUserType }) =>
      UpdateUser({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    fetchUsers: fetchUsersQuery.data,
    fetchUsersQuery,
    fetchNewClients: fetchNewClientsQuery.data,
    fetchNewClientsQuery,
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    createUserMutation,
    createNewClient: createNewClientMutation.mutate,
    createNewClientAsync: createNewClientMutation.mutateAsync,
    updateNewClientMutation,
    updateNewClient: updateNewClientMutation.mutate,
    updateNewClientAsync: updateNewClientMutation.mutateAsync,
    createNewClientMutation,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    deleteUserMutation,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    updateUserMutation,
  };
}

export function useUserProfile(userId: number) {
  const queryClient = useQueryClient();

  // Fetch single user profile
  const fetchUserProfileQuery = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const user = await fetchUserById(userId);
      return user;
    },
    enabled: !!userId,
  });

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      phone?: string;
      whatsapp?: string;
      bkashNumber?: string;
      nagadNumber?: string;
      bankAccountNumber?: string;
      branchName?: string;
      bankName?: string;
      swiftCode?: string;
      password?: string;
    }) => updateUserProfile(userId, data),
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });

  return {
    userProfile: fetchUserProfileQuery.data,
    fetchUserProfileQuery,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    updateProfileMutation,
  };
}
