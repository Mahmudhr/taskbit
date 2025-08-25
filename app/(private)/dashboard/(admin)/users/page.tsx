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
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddUserForm from '@/components/forms/add-user-form';
import AlertModal from '@/components/alert-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  generateQueryString,
  getErrorMessage,
  roleConvert,
  userStatusConvert,
} from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import { useUser } from '@/hooks/use-user';
import ConfirmModal from '@/components/confirm-modal';
import { toast } from 'sonner';
import UpdateUserForm from '@/components/forms/update-user-form';
import { UserType } from '@/types/common';
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
import UserDetailsView from '@/components/user-details-view';
import Modal from '@/components/modal';

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

// ✅ Helper function to check if user has received salary this month
const checkSalaryStatus = (user: UserType) => {
  if (!user.salary || user.salary === 0) {
    return { isPaid: true, status: 'no-salary' }; // No salary set
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Check if user has received payment this month
  const hasCurrentMonthPayment = user.salaries?.some((payment) => {
    const paymentDate = new Date(payment.createdAt);
    return (
      paymentDate.getMonth() === currentMonth &&
      paymentDate.getFullYear() === currentYear &&
      payment.status === 'PAID'
    );
  });

  return {
    isPaid: hasCurrentMonthPayment || false,
    status: hasCurrentMonthPayment ? 'paid' : 'due',
  };
};

// ✅ Component to display salary with due status
const SalaryDisplay = ({ user }: { user: UserType }) => {
  const salaryStatus = checkSalaryStatus(user);

  if (salaryStatus.status === 'no-salary') {
    return <span className='text-gray-500'>-</span>;
  }

  return (
    <div className='flex items-center gap-2'>
      <span>৳ {user.salary}</span>
      {salaryStatus.status === 'due' && (
        <Badge variant='destructive' className='text-xs px-2 py-0.5'>
          <AlertCircle className='w-3 h-3 mr-1' />
          Due
        </Badge>
      )}
      {salaryStatus.status === 'paid' && (
        <Badge variant='default' className='text-xs px-2 py-0.5 bg-green-500'>
          Paid
        </Badge>
      )}
    </div>
  );
};

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get('role') || 'all'
  );

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [updateUser, setUpdateUser] = useState<UserType | null>(null);
  const [viewUserModal, setViewUserModal] = useState(false);
  const [viewUser, setViewUser] = useState<UserType | null>(null);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    role: searchParams.get('role') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchUsers, fetchUsersQuery, deleteUserAsync } = useUser(queryString);

  const handleDeleUser = () => {
    if (userId === null) return;
    startTransition(() => {
      toast.promise(deleteUserAsync(userId), {
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

  const handleEditUser = (user: UserType) => {
    setUpdateUser(user);
    setUpdateUserModal(true);
  };

  const handleViewUser = (user: UserType) => {
    setViewUser(user);
    setViewUserModal(true);
  };

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
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  role: value === 'all' ? '' : value,
                }));
                setRoleFilter(value);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='ADMIN'>Admin</SelectItem>
                <SelectItem value='USER'>User</SelectItem>
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
            {params.role && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Role: {roleConvert[params.role as keyof typeof roleConvert]}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      role: '',
                    }));
                    setRoleFilter('all');
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
                    <TableHead>Salary Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className='text-center'>Actions</TableHead>
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
                          {roleConvert[user.role as keyof typeof roleConvert]}
                        </TableCell>
                        {/* ✅ Updated: Show salary with due status */}
                        <TableCell>
                          <SalaryDisplay user={user} />
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
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
                                {/* <DropdownMenuItem
                                  onClick={() =>
                                    handleCreatePayment(
                                      user.id,
                                      user.salary || 0
                                    )
                                  }
                                >
                                  <Banknote className='mr-2 h-4 w-4' />
                                  Make Payment
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className='mr-2 h-4 w-4' />
                                  Details
                                </DropdownMenuItem>
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
                      <div className='flex gap-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVertical className='w-5 h-5 text-gray-600' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              Details
                            </DropdownMenuItem>
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
                        <span className='capitalize'>
                          {roleConvert[user.role as keyof typeof roleConvert]}
                        </span>
                      </div>
                      {/* ✅ Updated: Show salary with due status in mobile view */}
                      <div className='flex justify-between items-center'>
                        <span className='text-muted-foreground'>Salary:</span>
                        <SalaryDisplay user={user} />
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
          {fetchUsers && fetchUsers?.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
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
          )}
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
      <Modal
        isOpen={viewUserModal}
        setIsOpen={setViewUserModal}
        title='User Details'
        description=' '
      >
        {viewUser && <UserDetailsView user={viewUser} />}
      </Modal>
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
