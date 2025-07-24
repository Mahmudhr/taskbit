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
  EllipsisVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AlertModal from '@/components/alert-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  generateQueryString,
  getErrorMessage,
  userStatusConvert,
} from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import ConfirmModal from '@/components/confirm-modal';
import { toast } from 'sonner';
import { ClientType } from '@/types/common';
import UserTableSkeleton from '@/components/skeletons/user-table-skeleton';
import UserCardSkeleton from '@/components/skeletons/user-card-skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dayjs from 'dayjs';
import CreateClientForm from '@/components/forms/create-client-form';
import { useClient } from '@/hooks/use-client';
import UpdateClientForm from '@/components/forms/update-client-form';

const getStatusBadge = (status: string) => {
  const variants = {
    active: 'default',
    inactive: 'secondary',
  } as const;
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {userStatusConvert[status as keyof typeof userStatusConvert] || status}
    </Badge>
  );
};

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [updateUser, setUpdateUser] = useState<ClientType | null>(null);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchAllClients, fetchClientsQuery, deleteClientAsync } =
    useClient(queryString);

  const handleDeleUser = () => {
    if (userId === null) return;
    startTransition(() => {
      toast.promise(deleteClientAsync(userId), {
        loading: 'Deleting user...',
        success: () => {
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

  const handleEditUser = (user: ClientType) => {
    setUpdateUser(user);
    setUpdateUserModal(true);
  };

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Clients</h1>
        <Button onClick={() => setAddUserOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Client
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
                placeholder='Search by name, email, or phone...'
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
                  status: value === 'all' ? '' : value,
                }));
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='INACTIVE'>Inactive</SelectItem>
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
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Status:{' '}
                {
                  userStatusConvert[
                    params.status as keyof typeof userStatusConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      status: '',
                    }));
                    setStatusFilter('all');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clients List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          {!fetchClientsQuery.isLoading ? (
            <div className='hidden md:block'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className='text-center'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchAllClients &&
                    fetchAllClients.data.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className='font-medium'>
                          {user.name}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {user.email}
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {getStatusBadge(user?.status || '')}
                        </TableCell>
                        <TableCell>
                          {dayjs(user.createdAt).format('DD-MM-YYYY')}
                        </TableCell>
                        <TableCell className='flex gap-2 justify-center'>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <EllipsisVertical className='w-5 h-5 text-gray-600' />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className='mr-2 h-4 w-4' />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setConfirmModal(true);
                                    setUserId(user.id);
                                  }}
                                  className='text-red-600'
                                >
                                  <UserX className='mr-2 h-4 w-4' />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
          {!fetchClientsQuery.isLoading ? (
            <div className='md:hidden space-y-4'>
              {fetchAllClients &&
                fetchAllClients.data.map((user, index) => (
                  <Card key={user.id} className='p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-start gap-2'>
                        <span className='text-sm text-muted-foreground'>
                          #{index + 1}
                        </span>
                        <h3 className='font-medium'>{user.name}</h3>
                      </div>
                      <div className='flex gap-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVertical className='w-5 h-5 text-gray-600' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setConfirmModal(true);
                                setUserId(user.id);
                              }}
                              className='text-red-600'
                            >
                              <UserX className='mr-2 h-4 w-4' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Role:</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Email:</span>
                        <span>
                          {user.email && user?.email.length > 25
                            ? user?.email.slice(0, 25) + '...'
                            : user?.email}
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
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Created:</span>
                        <span>
                          {dayjs(user.createdAt).format('DD-MM-YYYY')}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <UserCardSkeleton />
          )}
          {fetchAllClients && fetchAllClients?.meta.count > 0 && (
            <div className='flex items-center justify-between space-x-2 py-4'>
              <div className='text-sm text-muted-foreground'>
                {fetchAllClients &&
                  ` Showing ${params.page} to ${
                    fetchAllClients.meta.page * fetchAllClients.data.length
                  } of ${fetchAllClients.meta.count} results`}
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
                    +params.page ===
                    (fetchAllClients && fetchAllClients.meta.totalPages)
                  }
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertModal
        isOpen={addUserOpen}
        setIsOpen={setAddUserOpen}
        title='Create new user'
        description=' '
      >
        <CreateClientForm setIsOpen={setAddUserOpen} />
      </AlertModal>
      <AlertModal
        isOpen={updateUserModal}
        setIsOpen={setUpdateUserModal}
        title='Update user'
        description=' '
      >
        <UpdateClientForm setIsOpen={setUpdateUserModal} data={updateUser} />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your user '
        onClick={handleDeleUser}
      />
    </div>
  );
}
