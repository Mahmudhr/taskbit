'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/modal';
import AddUserForm from '@/components/forms/add-user-form';
import AlertModal from '@/components/alert-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateQueryString, getErrorMessage } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import { useUser } from '@/hooks/use-user';
import ConfirmModal from '@/components/confirm-modal';
import { toast } from 'sonner';
import UpdateUserForm from '@/components/forms/update-user-form';
import { UserType } from '@/types/common';
import UserTableSkeleton from '@/components/skeletons/user-table-skeleton';
import UserCardSkeleton from '@/components/skeletons/user-card-skeleton';

const getStatusBadge = (status: string) => {
  const variants = {
    active: 'default',
    inactive: 'secondary',
  } as const;
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status}
    </Badge>
  );
};

export default function UsersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [updateUser, setUpdateUser] = useState<UserType | null>(null);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchUsers, fetchUsersQuery, deleteUserAsync } = useUser(queryString);

  console.log({ check: fetchUsers, data: fetchUsersQuery.data });

  const handleDeleUser = () => {
    if (userId === null) return;
    startTransition(() => {
      toast.promise(deleteUserAsync(userId), {
        loading: 'Creating user...',
        success: (res) => {
          setConfirmModal(false);
          return 'Successfully User Deleted';
        },
        error: (err) => getErrorMessage(err) || 'Something went wrong!',
      });
    });
  };

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Users</h1>
        <Button onClick={() => setAddUserOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search users...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8'
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  status: value,
                }));
                setStatusFilter(statusFilter);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Users</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-wrap gap-2'>
            {params.search && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {params.search}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      search: '',
                    }));
                    setSearchQuery('');
                  }}
                >
                  <X className='w-5 h-5' />
                </span>
              </div>
            )}
            {params.status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                {params.status}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      status: '',
                    }));
                  }}
                >
                  <X className='w-5 h-5' />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          {!fetchUsersQuery.isLoading ? (
            <div className='hidden md:block'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchUsers &&
                    fetchUsers.data.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className='font-medium'>
                          {user.name}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {user.email}
                        </TableCell>
                        <TableCell className='capitalize'>
                          {user.role}
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setUpdateUserModal(true);
                                setUpdateUser(user);
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setConfirmModal(true);
                                setUserId(user.id);
                              }}
                            >
                              <UserX className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <UserTableSkeleton />
          )}

          {/* Mobile Card View */}
          {!fetchUsersQuery.isLoading ? (
            <div className='md:hidden space-y-4'>
              {fetchUsers &&
                fetchUsers.data.map((user, index) => (
                  <Card key={user.id} className='p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-start gap-2'>
                        <span className='text-sm text-muted-foreground'>
                          #{index + 1}
                        </span>
                        <h3 className='font-medium'>{user.name}</h3>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setUpdateUserModal(true);
                            setUpdateUser(user);
                          }}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setConfirmModal(true);
                            setUserId(user.id);
                          }}
                        >
                          <UserX className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Role:</span>
                        <span className='capitalize'>{user.role}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Email:</span>
                        <span>
                          {user.email.length > 25
                            ? user.email.slice(0, 25) + '...'
                            : user.email}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Phone:</span>
                        <span>{user.phone}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-muted-foreground'>Status:</span>
                        <span>{getStatusBadge(user.status)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <UserCardSkeleton />
          )}

          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-sm text-muted-foreground'>
              {fetchUsers &&
                ` Showing ${params.page} to ${
                  fetchUsers.meta.page * fetchUsers.data.length
                } of ${fetchUsers.meta.count} results`}
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    page: (+params.page - 1).toString(),
                  }))
                }
                disabled={+params.page === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    page: (+params.page + 1).toString(),
                  }))
                }
                disabled={
                  +params.page === (fetchUsers && fetchUsers.meta.totalPages)
                }
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertModal
        isOpen={addUserOpen}
        setIsOpen={setAddUserOpen}
        title='Create new user'
        description=' '
      >
        <AddUserForm setIsOpen={setAddUserOpen} />
      </AlertModal>
      <AlertModal
        isOpen={updateUserModal}
        setIsOpen={setUpdateUserModal}
        title='Update user'
        description=' '
      >
        <UpdateUserForm setIsOpen={setUpdateUserModal} data={updateUser} />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='his action cannot be undone. This will permanently delete your user '
        onClick={handleDeleUser}
      />
    </div>
  );
}
