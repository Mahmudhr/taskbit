'use client';

import { useState, useEffect, useTransition } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Grid3X3,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  useExpenses,
  useFetchAllExpenses,
  useFetchExpenseCalculation,
} from '@/hooks/use-expense';
import { ExpensesType } from '@/types/common';
import AlertModal from '@/components/alert-modal';
import CreateExpenseForm from '@/components/forms/create-expense-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateQueryString, getErrorMessage } from '@/lib/utils';
import UpdateExpenseForm from '@/components/forms/update-expense-form';
import { useDebouncedCallback } from 'use-debounce';
import ConfirmModal from '@/components/confirm-modal';
import { toast } from 'sonner';
import ExpenseTableRowSkeleton from '@/components/skeletons/expense-table-row-skeleton';
import ExpenseCardSkeleton from '@/components/skeletons/expense-table-card-skeleton';

// Skeleton Components

// Expense Card Component for Mobile
const ExpenseCard = ({
  expense,
  index,
  setSelectedExpense,
  setIsOpen,
  setConfirmDelete,
  setSelectedExpenseId,
}: {
  expense: ExpensesType;
  index: number;
  setIsOpen: (open: boolean) => void;
  setSelectedExpense: (expense: ExpensesType | null) => void;
  setConfirmDelete: (open: boolean) => void;
  setSelectedExpenseId: (id: number | null) => void;
}) => {
  return (
    <Card className='mb-4 hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
              #
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-gray-200'>
                {expense.title}
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-200'>
                ID: #{index + 1}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <div className='text-lg font-bold text-green-600'>
              ৳ {expense.amount.toLocaleString()}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedExpense(expense);
                    setIsOpen(true);
                  }}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='text-red-600'
                  onClick={() => {
                    setConfirmDelete(true);
                    setSelectedExpenseId(expense.id);
                  }}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <span className='text-gray-500 dark:text-gray-300'>Created:</span>
            <span className='ml-1 font-medium'>
              {dayjs(expense.createdAt).format('DD/MM/YY')}
            </span>
          </div>
          <div>
            <span className='text-gray-500 dark:text-gray-300'>Updated:</span>
            <span className='ml-1 font-medium'>
              {dayjs(expense.updatedAt).format('DD/MM/YY')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Table Row Component
const ExpenseTableRow = ({
  expense,
  index,
  setSelectedExpense,
  setIsOpen,
  setConfirmDelete,
  setSelectedExpenseId,
}: {
  expense: ExpensesType;
  index: number;
  setIsOpen: (open: boolean) => void;
  setSelectedExpense: (expense: ExpensesType | null) => void;
  setConfirmDelete: (open: boolean) => void;
  setSelectedExpenseId: (id: number | null) => void;
}) => {
  return (
    <TableRow>
      <TableCell className='font-medium'>#{index + 1}</TableCell>
      <TableCell className='font-medium'>{expense.title}</TableCell>
      <TableCell className='font-semibold text-green-600'>
        ৳ {expense.amount.toLocaleString()}
      </TableCell>
      <TableCell className='text-sm text-gray-500 dark:text-gray-200'>
        {dayjs(expense.createdAt).format('DD MMM YYYY, h:mm A')}
      </TableCell>
      <TableCell className='text-sm text-gray-500 dark:text-gray-200'>
        {dayjs(expense.updatedAt).format('DD MMM YYYY, h:mm A')}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => {
                setSelectedExpense(expense);
                setIsOpen(true);
              }}
            >
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600'
              onClick={() => {
                setConfirmDelete(true);
                setSelectedExpenseId(expense.id);
              }}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [openCreateExpense, setOpenCreateExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpensesType | null>(
    null
  );
  const [openUpdateExpense, setOpenUpdateExpense] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [isPending, startTransition] = useTransition();

  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null
  );

  const { deleteExpenseMutationAsync } = useExpenses();

  // Unified params state for all filters
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
    date: searchParams.get('date') || '',
  });

  const queryString = generateQueryString(params);
  const {
    data: expensesData,
    isLoading,
    error,
  } = useFetchAllExpenses(queryString);

  const { data: expenseCalculation, isLoading: isLoadingExpenseCalculation } =
    useFetchExpenseCalculation(queryString);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
      } else {
        setViewMode('table');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clearFilters = () => {
    setParams({
      search: '',
      page: '1',
      month: '',
      year: '',
      date: '',
    });
    setDateFilter('ALL');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleDeleteExpense = () => {
    if (selectedExpenseId === null) return;
    startTransition(() => {
      toast.promise(deleteExpenseMutationAsync(selectedExpenseId), {
        loading: 'Deleting expense...',
        success: () => {
          setConfirmModal(false);
          return 'Successfully Expense Deleted';
        },
        error: (err) => getErrorMessage(err) || 'Something went wrong!',
      });
    });
  };

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='text-red-500 text-6xl'>⚠️</div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Failed to load expenses
          </h2>
          <p className='text-gray-600'>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3 md:space-y-6 p-2 md:p-6'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Expense Management</h1>
          <p className='text-muted-foreground'>Track and manage all expenses</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={() => setOpenCreateExpense(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Expense
          </Button>
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

      {/* Stats Overview */}
      {!isLoadingExpenseCalculation ? (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className=''>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className=' text-sm font-medium'>Total Expenses</p>
                  <p className='text-3xl font-bold'>
                    {expenseCalculation?.data.totalExpenses}
                  </p>
                </div>
                <TrendingUp className='h-8 w-8 ' />
              </div>
            </CardContent>
          </Card>

          <Card className=''>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Total Amount</p>
                  <p className='text-2xl font-bold'>
                    ৳ {expenseCalculation?.data.totalAmount}
                  </p>
                </div>
                <DollarSign className='h-8 w-8' />
              </div>
            </CardContent>
          </Card>

          <Card className=''>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Average Amount</p>
                  <p className='text-2xl font-bold'>
                    ৳ {expenseCalculation?.data.averageAmount}
                  </p>
                </div>
                <TrendingUp className='h-8 w-8' />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[1, 2, 3].map((i) => (
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

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Search Bar */}
          <div className='space-y-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search expenses or IDs...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-10 h-11'
              />
            </div>

            {/* Date Filters */}
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date Filter
                </label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Filter by date' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Time</SelectItem>
                    <SelectItem value='MONTH_YEAR'>Month & Year</SelectItem>
                    <SelectItem value='DATE'>Specific Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === 'MONTH_YEAR' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Month
                    </label>
                    <Select
                      value={params.month}
                      onValueChange={(month) =>
                        setParams((prev) => ({
                          ...prev,
                          month,
                          date: '',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select month' />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {dayjs().month(i).format('MMMM')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Year
                    </label>
                    <Select
                      value={params.year}
                      onValueChange={(year) =>
                        setParams((prev) => ({
                          ...prev,
                          year,
                          date: '',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select year' />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {dateFilter === 'DATE' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date
                  </label>
                  <Input
                    type='date'
                    value={params.date}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        date: e.target.value,
                        month: '',
                        year: '',
                      }))
                    }
                  />
                </div>
              )}

              <div className='flex items-end'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='w-full'
                >
                  Clear Filters
                </Button>
              </div>
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
            {params.month && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Month:{' '}
                {dayjs()
                  .month(+params.month - 1)
                  .format('MMMM')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      month: '',
                    }));
                    setSearchQuery('');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.year && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Year: {params.year}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      year: '',
                    }));
                    setSearchQuery('');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
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
                    setSearchQuery('');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {expensesData && expensesData.data.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='text-gray-400 text-6xl mb-4'>💰</div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No expenses found
            </h3>
            <p className='text-gray-600'>
              {params.search || dateFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'No expense records have been created yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          {viewMode === 'table' &&
            (!isLoading ? (
              <Card className='hidden sm:block'>
                <CardContent className='p-0'>
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='font-semibold'>ID</TableHead>
                          <TableHead className='font-semibold'>Title</TableHead>
                          <TableHead className='font-semibold'>
                            Amount
                          </TableHead>
                          <TableHead className='font-semibold'>
                            Created
                          </TableHead>
                          <TableHead className='font-semibold'>
                            Updated
                          </TableHead>
                          <TableHead className='font-semibold'>
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expensesData &&
                          expensesData.data.map(
                            (expense: ExpensesType, index: number) => (
                              <ExpenseTableRow
                                key={expense.id}
                                expense={expense}
                                index={index}
                                setSelectedExpense={setSelectedExpense}
                                setIsOpen={setOpenUpdateExpense}
                                setConfirmDelete={setConfirmModal}
                                setSelectedExpenseId={setSelectedExpenseId}
                              />
                            )
                          )}
                      </TableBody>
                    </Table>
                  </div>
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
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <ExpenseTableRowSkeleton key={i} />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

          {/* Mobile Card View */}
          {viewMode === 'cards' &&
            (!isLoading ? (
              <div className='space-y-4'>
                {expensesData &&
                  expensesData.data.map(
                    (expense: ExpensesType, index: number) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        index={index}
                        setSelectedExpense={setSelectedExpense}
                        setIsOpen={setOpenUpdateExpense}
                        setConfirmDelete={setConfirmModal}
                        setSelectedExpenseId={setSelectedExpenseId}
                      />
                    )
                  )}
              </div>
            ) : (
              <div className='space-y-4'>
                <Skeleton className='h-6 w-48' />
                {[1, 2, 3, 4, 5].map((i) => (
                  <ExpenseCardSkeleton key={i} />
                ))}
              </div>
            ))}
        </>
      )}
      {expensesData && expensesData?.meta.count > 0 && (
        <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
          <div className='text-sm text-muted-foreground'>
            {expensesData &&
              ` Showing ${params.page} to ${
                expensesData.meta.page * expensesData.data.length
              } of ${expensesData.meta.count} results`}
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
                +params.page === (expensesData && expensesData.meta.totalPages)
              }
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Create Expense Modal */}
      <AlertModal
        isOpen={openCreateExpense}
        setIsOpen={setOpenCreateExpense}
        title='Create new expense'
        description=' '
      >
        <CreateExpenseForm setIsOpen={setOpenCreateExpense} />
      </AlertModal>
      <AlertModal
        isOpen={openUpdateExpense}
        setIsOpen={setOpenUpdateExpense}
        title='Create new expense'
        description=' '
      >
        <UpdateExpenseForm
          setIsOpen={setOpenUpdateExpense}
          data={selectedExpense}
        />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your expense'
        onClick={handleDeleteExpense}
      />
    </div>
  );
}
