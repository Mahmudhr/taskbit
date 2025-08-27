'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ListFilter,
  EllipsisVertical,
  SquarePen,
  Trash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayment } from '@/hooks/use-payment';
import { $Enums } from '@prisma/client';
import TaskTableSkeleton from '@/components/skeletons/task-table-skeleton';
import TaskCardSkeleton from '@/components/skeletons/task-card-skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import {
  cn,
  generateQueryString,
  getErrorMessage,
  paymentStatusConvert,
  paymentTypeConvert,
} from '@/lib/utils';
import dayjs from 'dayjs';
import Modal from '@/components/modal';
import UpdatePaymentForm from '@/components/forms/update-payment-form';
import { PaymentTypes } from '@/types/common';
import PaymentFilter from '@/components/filters/payment-filter';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import ConfirmModal from '@/components/confirm-modal';

export const getStatusBadge = (status: $Enums.PaymentStatus) => {
  const variants = {
    PENDING: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200',
    FAILED: 'bg-red-100 text-red-800 hover:bg-red-200',
  } as const;
  return (
    <Badge className={cn(variants[status])}>
      {paymentStatusConvert[status]}
    </Badge>
  );
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const [taskId, setTaskId] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentTypes | null>(null);
  const [updatePaymentOpen, setUpdatePaymentOpen] = useState(false);
  const [openPaymentFilter, setOpenPaymentFilter] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const router = useRouter();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    date: searchParams.get('date') || '',
    payment_type: searchParams.get('payment_type') || '',
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const queryString = generateQueryString(params);
  const {
    fetchPayments,
    fetchPaymentsMutation,
    fetchPaymentsCalculationMutation,
    deletePaymentAsync,
  } = usePayment(queryString);

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const handleDeletePayment = () => {
    if (taskId === null) return;
    startDeleteTransition(() => {
      toast.promise(deletePaymentAsync(taskId), {
        loading: 'Deleting payment...',
        success: () => {
          setConfirmModal(false);
          return 'Successfully payment Deleted';
        },
        error: (err) => getErrorMessage(err) || 'Something went wrong!',
      });
    });
  };

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Payments Management</h1>
      </div>
      <div>
        {!fetchPaymentsCalculationMutation.isLoading ? (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold'>
                  {fetchPaymentsCalculationMutation?.data?.totalPayments || 0}
                </div>
                <div className='text-xs text-muted-foreground'>
                  Total Entries
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {fetchPaymentsCalculationMutation?.data?.completedCount}
                </div>
                <div className='text-xs text-muted-foreground'>Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {fetchPaymentsCalculationMutation?.data?.pendingCount}
                </div>
                <div className='text-xs text-muted-foreground'>Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {fetchPaymentsCalculationMutation?.data?.failedCount}
                </div>
                <div className='text-xs text-muted-foreground'>Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  ৳{' '}
                  {fetchPaymentsCalculationMutation?.data?.totalCompletedAmount}
                </div>
                <div className='text-xs text-muted-foreground'>
                  Total Amount
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Skeleton className='h-4 w-24 mb-2' />
                      <Skeleton className='h-8 w-16' />
                    </div>
                    <Skeleton className='h-8 w-8' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                placeholder='Search tasks...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8'
              />
            </div>

            <Button
              onClick={() => setOpenPaymentFilter(true)}
              className='w-full sm:w-auto'
            >
              <ListFilter /> Filter
            </Button>
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
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Status:{' '}
                {params.status !== 'ALL'
                  ? paymentStatusConvert[
                      params.status as keyof typeof paymentStatusConvert
                    ]
                  : params.status}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      status: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.date && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Created At: {params.date}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      date: '',
                    }));
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
          <CardTitle>Payments List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            {!fetchPaymentsMutation.isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Task Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchPayments &&
                    fetchPayments.data.map((payment, index) => (
                      <TableRow key={payment.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className='font-medium'>
                          {payment.referenceNumber}
                        </TableCell>
                        <TableCell>
                          {paymentTypeConvert[payment.paymentType]}
                        </TableCell>
                        <TableCell>৳ {payment.amount}</TableCell>
                        <TableCell className='max-w-sm break-words'>
                          {payment.task.title}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {dayjs(payment.createdAt).format('DD-MM-YYYY')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <EllipsisVertical className='w-5 h-5 text-gray-600' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Options</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setUpdatePaymentOpen(true);
                                  setTaskId(payment.id);
                                  setPaymentData(payment);
                                }}
                              >
                                <SquarePen className='mr-2 h-4 w-4' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setConfirmModal(true);
                                  setTaskId(payment.id);
                                }}
                              >
                                <Trash className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {/* <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setUpdatePaymentOpen(true);
                              setTaskId(payment.id);
                              setPaymentData(payment);
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button> */}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <TaskTableSkeleton />
            )}
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {!fetchPaymentsMutation.isLoading ? (
              fetchPayments &&
              fetchPayments.data.map((payment, index) => (
                <Card key={payment.id} className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-muted-foreground'>
                        #{index + 1}
                      </span>
                      <span className='font-medium'>
                        {payment.referenceNumber}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisVertical className='w-5 h-5 text-gray-600' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setUpdatePaymentOpen(true);
                            setTaskId(payment.id);
                            setPaymentData(payment);
                          }}
                        >
                          <SquarePen className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setConfirmModal(true);
                            setTaskId(payment.id);
                          }}
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Amount:</span>
                      <span className='font-medium'>৳ {payment.amount}</span>
                    </div>
                    <div className='flex justify-between gap-1'>
                      <span className='text-muted-foreground'>Task:</span>
                      <span className='break-all'>{payment.task.title}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Created At:</span>
                      {dayjs(payment.createdAt).format('DD-MM-YYYY')}
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Status:</span>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <TaskCardSkeleton />
            )}
          </div>
          {fetchPayments && fetchPayments?.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
              {
                <div className='text-sm text-muted-foreground'>
                  Showing 1 to {fetchPayments.data.length} of{' '}
                  {fetchPayments.meta.count} results
                </div>
              }
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
                    (fetchPayments && fetchPayments.meta.totalPages)
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
      <Modal
        isOpen={updatePaymentOpen}
        setIsOpen={setUpdatePaymentOpen}
        title='Update Payment'
        description=' '
      >
        {paymentData && (
          <UpdatePaymentForm
            setIsOpen={setUpdatePaymentOpen}
            taskId={taskId}
            data={paymentData}
          />
        )}
      </Modal>
      <Modal
        isOpen={openPaymentFilter}
        setIsOpen={setOpenPaymentFilter}
        title='Filter Salary'
        description=' '
      >
        <PaymentFilter
          setParams={setParams}
          params={params}
          setOpenPaymentFilter={setOpenPaymentFilter}
        />
      </Modal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPendingDelete}
        title='This action cannot be undone. This will permanently delete your payment.'
        onClick={handleDeletePayment}
      />
    </div>
  );
}
