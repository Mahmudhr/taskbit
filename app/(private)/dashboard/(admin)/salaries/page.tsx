'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  useFetchAllSalaries,
  useFetchAllSalariesCalculations,
  useSalary,
} from '@/hooks/use-salary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Filter,
  Calendar,
  User,
  Copy,
  Check,
  Grid3X3,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  ListFilter,
} from 'lucide-react';
import {
  cn,
  salaryStatusConvert,
  salaryTypeConvert,
  paymentTypeConvert,
  generateQueryString,
  getErrorMessage,
} from '@/lib/utils';
import { $Enums } from '@prisma/client';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { SalaryType, UserType } from '@/types/common';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import ExpenseTableRowSkeleton from '@/components/skeletons/expense-table-row-skeleton';
import ExpenseCardSkeleton from '@/components/skeletons/expense-table-card-skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmModal from '@/components/confirm-modal';
import Modal from '@/components/modal';
import SalaryFilter from '@/components/filters/salary-filter';

const getStatusBadge = (status: $Enums.SalaryStatus) => {
  const variants = {
    PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    PAID: 'bg-green-100 text-green-800 hover:bg-green-200',
    CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
  } as const;
  return (
    <Badge className={cn(variants[status])}>
      {salaryStatusConvert[status]}
    </Badge>
  );
};

// Salary type badge component
const getSalaryTypeBadge = (type: $Enums.SalaryType) => {
  const variants = {
    MONTHLY: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    BONUS: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    OVERTIME: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  } as const;
  return (
    <Badge className={cn(variants[type])}>{salaryTypeConvert[type]}</Badge>
  );
};

// Payment type badge component
const getPaymentTypeBadge = (type: $Enums.PaymentType) => {
  const variants = {
    BANK_TRANSFER: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    BKASH: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    NAGAD: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
  } as const;
  return (
    <Badge className={cn(variants[type])}>{paymentTypeConvert[type]}</Badge>
  );
};

// Salary card component for mobile view
const SalaryCard = ({
  salary,
  index,
  setConfirmModal,
  setDeletingSalaryId,
}: {
  salary: Omit<SalaryType, 'user'> & { user: Partial<UserType> };
  index: number;
  setConfirmModal: (open: boolean) => void;
  setDeletingSalaryId: (id: number | null) => void;
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Salary #{index + 1}</CardTitle>
          <div className='flex gap-2'>
            <div className='text-right'>
              <div className='text-lg font-semibold text-green-600'>
                ৳ {salary.amount.toLocaleString()}
              </div>
              <div className='text-xs text-muted-foreground'>
                {monthNames[salary.month - 1]} {salary.year}
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical className='w-5 h-5 text-gray-600' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      setConfirmModal(true);
                      setDeletingSalaryId(salary.id);
                    }}
                    className='text-red-600'
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap gap-2 mt-3'>
          {getStatusBadge(salary.status)}
          {getSalaryTypeBadge(salary.salaryType)}
          {getPaymentTypeBadge(salary.paymentType)}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Employee Info */}
        <div className='flex items-center gap-2 p-2 bg-blue-50 rounded'>
          <User className='h-4 w-4 text-blue-600' />
          <div>
            <div className='font-medium text-sm'>{salary.user.name}</div>
            <div className='text-xs text-muted-foreground'>
              {salary.user.email}
            </div>
          </div>
        </div>

        {/* Reference Number */}
        {salary.referenceNumber && (
          <div className='flex items-center justify-between p-2 bg-muted rounded'>
            <div>
              <div className='text-xs font-medium text-muted-foreground'>
                Reference
              </div>
              <div className='text-sm'>{salary.referenceNumber}</div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                handleCopy(salary.referenceNumber ?? '', 'Reference Number')
              }
              className='h-6 w-6 p-0'
            >
              {copiedField === 'Reference Number' ? (
                <Check className='h-3 w-3 text-green-600' />
              ) : (
                <Copy className='h-3 w-3' />
              )}
            </Button>
          </div>
        )}

        {/* Date */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Calendar className='h-4 w-4' />
          <span>
            Created: {dayjs(salary.createdAt).format('DD MMM YYYY, h:mm A')}
          </span>
        </div>

        {/* Note */}
        {salary.note && (
          <div className='p-2 bg-gray-50 rounded'>
            <div className='text-xs font-medium text-muted-foreground mb-1'>
              Note
            </div>
            <div className='text-sm'>{salary.note}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SalariesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingSalaryId, setDeletingSalaryId] = useState<number | null>(null);
  const [openSalaryFilter, setOpenSalaryFilter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    salary_type: searchParams.get('salary_type') || '',
    payment_type: searchParams.get('payment_type') || '',
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
    date: searchParams.get('date') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const {
    data: allSalaries,
    isLoading,
    error,
  } = useFetchAllSalaries(queryString);

  const { data: allSalariesCalc, isLoading: isLoadingAllSalariesCalc } =
    useFetchAllSalariesCalculations(queryString);

  const { deleteSalaryMutationAsync } = useSalary();

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  // const clearFilters = () => {
  //   setSearchQuery('');
  //   setParams({
  //     search: '',
  //     page: '1',
  //     status: '',
  //     payment_type: '',
  //     salary_type: '',
  //   });
  // };

  const handleDeleteSalary = () => {
    if (deletingSalaryId === null) return;
    startTransition(() => {
      toast.promise(deleteSalaryMutationAsync(deletingSalaryId), {
        loading: 'Deleting user...',
        success: () => {
          setConfirmModal(false);
          return 'Successfully User Deleted';
        },
        error: (err) => getErrorMessage(err) || 'Something went wrong!',
      });
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // if (isLoading) {
  //   return (
  //     <div className='flex items-center justify-center min-h-[400px]'>
  //       <div className='text-center'>
  //         <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
  //         <p>Loading salaries...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>
          Error loading salaries. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3 md:space-y-6 p-2 md:p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>All Salaries</h1>
          <p className='text-muted-foreground'>
            Manage and view all employee salary records
          </p>
        </div>

        {/* View Toggle - Mobile/Desktop */}
        <div className='flex items-center gap-2'>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('table')}
            className='hidden sm:flex'
          >
            <List className='h-4 w-4 mr-2' />
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('cards')}
          >
            <Grid3X3 className='h-4 w-4 mr-2' />
            Cards
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoadingAllSalariesCalc ? (
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>
                {allSalariesCalc?.data.totalSalaries}
              </div>
              <div className='text-xs text-muted-foreground'>Total Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {allSalariesCalc?.data.paidCount}
              </div>
              <div className='text-xs text-muted-foreground'>Paid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {allSalariesCalc?.data.pendingCount}
              </div>
              <div className='text-xs text-muted-foreground'>Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {allSalariesCalc?.data.cancelledCount}
              </div>
              <div className='text-xs text-muted-foreground'>Cancelled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-lg font-bold text-green-600'>
                ৳ {allSalariesCalc?.data.totalAmount}
              </div>
              <div className='text-xs text-muted-foreground'>Total Paid</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
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

      {/* Search and Filters */}
      <Card>
        <CardContent className='p-4 space-y-2'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, reference, or ID...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-10'
              />
            </div>

            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-2'>
              {/* Status Filter */}
              <Button
                onClick={() => setOpenSalaryFilter(true)}
                className='w-full sm:w-auto'
              >
                <ListFilter /> Filter
              </Button>
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
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Status:{' '}
                {
                  salaryStatusConvert[
                    params.status as keyof typeof salaryStatusConvert
                  ]
                }
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
            {params.salary_type && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Salary Type:{' '}
                {
                  salaryTypeConvert[
                    params.salary_type as keyof typeof salaryTypeConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      salary_type: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.payment_type && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Payment Type:{' '}
                {
                  paymentTypeConvert[
                    params.payment_type as keyof typeof paymentTypeConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      payment_type: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.month && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Month :{' '}
                {dayjs()
                  .month(+params.month - 1)
                  .format('MMMM')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      month: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.year && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Year : {params.year}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      year: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.date && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Date : {params.date}
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

      {/* Results */}
      {allSalaries?.data.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center'>
            <div className='text-muted-foreground'>
              <Filter className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>No salaries found</p>
              <p className='text-sm'>
                Try adjusting your search terms or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          {viewMode === 'table' &&
            (!isLoading ? (
              <Card className='hidden sm:block'>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allSalaries?.data.map((salary, index) => (
                        <TableRow key={salary.id}>
                          <TableCell className='font-medium'>
                            #{index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {salary.user.name}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {salary.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='font-semibold text-green-600'>
                            ৳ {salary.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(0, salary.month - 1).toLocaleString(
                              'default',
                              { month: 'short' }
                            )}{' '}
                            {salary.year}
                          </TableCell>
                          <TableCell>
                            {getSalaryTypeBadge(salary.salaryType)}
                          </TableCell>
                          <TableCell>
                            {getPaymentTypeBadge(salary.paymentType)}
                          </TableCell>
                          <TableCell>{getStatusBadge(salary.status)}</TableCell>
                          <TableCell className='text-xs'>
                            {salary.referenceNumber || '-'}
                          </TableCell>
                          <TableCell className='text-xs'>
                            {dayjs(salary.createdAt).format('DD/MM/YY')}
                          </TableCell>
                          <TableCell className='text-xs'>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <EllipsisVertical className='w-5 h-5 text-gray-600' />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setConfirmModal(true);
                                      setDeletingSalaryId(salary.id);
                                    }}
                                    className='text-red-600'
                                  >
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
                </CardContent>
              </Card>
            ) : (
              <Card className='hidden sm:block'>
                <CardHeader>
                  <Skeleton className='h-6 w-48' />
                </CardHeader>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <ExpenseTableRowSkeleton key={i} />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

          {/* Mobile Card View */}
          {(viewMode === 'cards' || isMobile) &&
            (!isLoading ? (
              <div className='space-y-4'>
                {allSalaries?.data.map((salary, index) => (
                  <SalaryCard
                    key={salary.id}
                    salary={salary}
                    index={index}
                    setConfirmModal={setConfirmModal}
                    setDeletingSalaryId={setDeletingSalaryId}
                  />
                ))}
              </div>
            ) : (
              <div className='space-y-4'>
                <Skeleton className='h-6 w-48' />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ExpenseCardSkeleton key={i} />
                ))}
              </div>
            ))}
          {allSalaries && allSalaries?.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
              <div className='text-sm text-muted-foreground'>
                {allSalaries &&
                  ` Showing ${params.page} to ${
                    allSalaries.meta.page * allSalaries.data.length
                  } of ${allSalaries.meta.count} results`}
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
                    (allSalaries && allSalaries.meta.totalPages)
                  }
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <Modal
        isOpen={openSalaryFilter}
        setIsOpen={setOpenSalaryFilter}
        title='Filter Salary'
        description=' '
      >
        <SalaryFilter
          setParams={setParams}
          params={params}
          setOpenSalaryFilter={setOpenSalaryFilter}
        />
      </Modal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete salary'
        onClick={handleDeleteSalary}
      />
    </div>
  );
}
