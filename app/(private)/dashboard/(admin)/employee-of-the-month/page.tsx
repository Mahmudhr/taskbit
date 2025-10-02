'use client';

import AlertModal from '@/components/alert-modal';
import CreateEmployeeOfTheMonthForm from '@/components/forms/create-employee-of-the-month-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useEmployeeOfTheMonth from '@/hooks/use-employee-of-the-month';
import { generateQueryString } from '@/lib/utils';
import dayjs from 'dayjs';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmployeeOfMonthCard from '@/components/employee-of-month-card';
import EmployeeOfMonthCardSkeleton from '@/components/skeletons/employee-of-month-card-skeleton';
import { useDebouncedCallback } from 'use-debounce';

export default function EmployeeOfTheMonthPage() {
  const [openCreateEmployeeOfTheMonth, setOpenCreateEmployeeOfTheMonth] =
    useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  //   const [isPending, startTransition] = useTransition();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
    date: searchParams.get('date') || '',
  });

  const queryString = generateQueryString(params);

  const { getAllEmployeesOfTheMonth, getAllEmployeesOfTheMonthData } =
    useEmployeeOfTheMonth(queryString);

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const clearFilters = () => {
    setParams({
      search: '',
      page: '1',
      month: '',
      year: '',
      date: '',
    });
  };

  return (
    <div className='space-y-3 md:space-y-6 p-2 md:p-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Employee of the month</h1>
          <p className='text-muted-foreground'>
            Track and manage all employees of the month
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={() => setOpenCreateEmployeeOfTheMonth(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Employee of the month
          </Button>
        </div>
      </div>
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
      <div>
        {/* Results / List */}
        <div className='grid grid-cols-1 gap-4'>
          {getAllEmployeesOfTheMonth.isLoading && (
            <>
              <EmployeeOfMonthCardSkeleton />
              <EmployeeOfMonthCardSkeleton />
              <EmployeeOfMonthCardSkeleton />
            </>
          )}

          {!getAllEmployeesOfTheMonth.isLoading &&
            getAllEmployeesOfTheMonthData &&
            getAllEmployeesOfTheMonthData.data.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
                {getAllEmployeesOfTheMonthData.data.map((employee) => (
                  <EmployeeOfMonthCard key={employee.id} employee={employee} />
                ))}
              </div>
            )}

          {!getAllEmployeesOfTheMonth.isLoading &&
            getAllEmployeesOfTheMonthData &&
            getAllEmployeesOfTheMonthData.data.length === 0 && (
              <div className='py-12 text-center text-muted-foreground'>
                No employees of the month found.
              </div>
            )}

          {/* Pagination */}
          {getAllEmployeesOfTheMonthData &&
            getAllEmployeesOfTheMonthData?.meta.count > 0 && (
              <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
                <div className='text-sm text-muted-foreground'>
                  {getAllEmployeesOfTheMonthData &&
                    ` Showing ${params.page} to ${
                      getAllEmployeesOfTheMonthData.meta.page *
                      getAllEmployeesOfTheMonthData.data.length
                    } of ${getAllEmployeesOfTheMonthData.meta.count} results`}
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
                      (getAllEmployeesOfTheMonthData &&
                        getAllEmployeesOfTheMonthData.meta.totalPages)
                    }
                  >
                    Next
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
      <AlertModal
        isOpen={openCreateEmployeeOfTheMonth}
        setIsOpen={setOpenCreateEmployeeOfTheMonth}
        title='Create Employee of the month'
        description=' '
      >
        <CreateEmployeeOfTheMonthForm
          setIsOpen={setOpenCreateEmployeeOfTheMonth}
        />
      </AlertModal>
    </div>
  );
}
