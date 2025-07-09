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
} from '../server/user/user';
import { CreateUserType } from '../server/types/user-type';
import { Meta, Response, UserType } from '@/types/common';

export function useUser(options?: string) {
  const queryClient = useQueryClient();

  // Fetch users
  const fetchUsersQuery = useQuery<Response<UserType[], Meta>>({
    queryKey: ['users', options],
    queryFn: async () => {
      const res = await fetchAllUser(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserType) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    createUserMutation,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    deleteUserMutation,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    updateUserMutation,
  };
}
