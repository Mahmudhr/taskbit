'use client';

import { useEffect, useState } from 'react';
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
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronDownIcon,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { usePayment } from '@/hooks/use-payment';
import { $Enums } from '@prisma/client';
import TaskTableSkeleton from '@/components/skeletons/task-table-skeleton';
import TaskCardSkeleton from '@/components/skeletons/task-card-skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import {
  cn,
  generateQueryString,
  paymentStatusConvert,
  paymentTypeConvert,
} from '@/lib/utils';
import dayjs from 'dayjs';
import Modal from '@/components/modal';
import UpdatePaymentForm from '@/components/forms/update-payment-form';
import { PaymentTypes } from '@/types/common';

const getStatusBadge = (status: $Enums.PaymentStatus) => {
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
  const [openDate, setDateOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentTypes | null>(null);
  const [updatePaymentOpen, setUpdatePaymentOpen] = useState(false);

  const router = useRouter();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    date: searchParams.get('date') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const queryString = generateQueryString(params);
  const { fetchPayments, fetchPaymentsMutation } = usePayment(queryString);

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
        <h1 className='text-xl md:text-3xl font-bold'>Payments Management</h1>
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
            <Select
              value={params.status}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  status: value === 'ALL' ? '' : value,
                }));
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter payments' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Payments</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='FAILED'>Failed</SelectItem>
              </SelectContent>
            </Select>
            <div className='flex flex-col gap-3'>
              <Popover open={openDate} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    id='date'
                    className='w-48 justify-between font-normal'
                  >
                    {date ? date.toLocaleDateString() : 'Select date'}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto overflow-hidden p-0'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={date}
                    captionLayout='dropdown'
                    onSelect={(date) => {
                      setDate(date);
                      setParams((prev) => ({
                        ...prev,
                        date: date ? dayjs(date).format('YYYY-MM-DD') : '',
                      }));
                      setDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
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
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
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
                  <X className='w-5 h-5' />
                </span>
              </div>
            )}
            {params.date && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {params.date}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      date: '',
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
                        <TableCell>{payment.task.title}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {dayjs(payment.createdAt).format('DD-MM-YYYY')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setUpdatePaymentOpen(true);
                              setTaskId(payment.id);
                              setPaymentData(payment);
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
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
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setUpdatePaymentOpen(true)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Amount:</span>
                      <span className='font-medium'>৳ {payment.amount}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Task:</span>
                      <span>{payment.task.title}</span>
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
            <div className='flex items-center justify-between space-x-2 py-4'>
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
    </div>
  );
}
