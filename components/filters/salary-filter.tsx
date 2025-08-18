'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import dayjs from 'dayjs';
import {
  paymentTypeConvert,
  salaryStatusConvert,
  salaryTypeConvert,
} from '@/lib/utils';

type ParamsType = {
  search: string;
  page: string;
  status: string;
  salary_type: string;
  payment_type: string;
  month: string;
  year: string;
  date: string;
};

type SalaryFilterProps = {
  params: ParamsType;
  setParams: React.Dispatch<React.SetStateAction<ParamsType>>;
  setOpenSalaryFilter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SalaryFilter({
  params,
  setParams,
  setOpenSalaryFilter,
}: SalaryFilterProps) {
  const [dateFilter, setDateFilter] = useState('ALL');

  // Generate years for dropdown (current year and 4 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const clearFilters = () => {
    setParams({
      search: '',
      page: '1',
      status: '',
      salary_type: '',
      payment_type: '',
      month: '',
      year: '',
      date: '',
    });
    setDateFilter('ALL');
  };

  const applyFilters = () => {
    setOpenSalaryFilter(false);
  };

  return (
    <div className='space-y-6'>
      {/* Status Filter */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium  text-muted-foreground'>
          Status
        </label>
        <Select
          value={params.status}
          onValueChange={(status) =>
            setParams((prev) => ({
              ...prev,
              status,
              page: '1',
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent className='z-[999]'>
            <SelectItem value='ALL'>All Status</SelectItem>
            <SelectItem value='PENDING'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                Pending
              </div>
            </SelectItem>
            <SelectItem value='PAID'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                Paid
              </div>
            </SelectItem>
            <SelectItem value='CANCELLED'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                Cancelled
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Salary Type Filter */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium  text-muted-foreground'>
          Salary Type
        </label>
        <Select
          value={params.salary_type}
          onValueChange={(salary_type) =>
            setParams((prev) => ({
              ...prev,
              salary_type,
              page: '1',
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select salary type' />
          </SelectTrigger>
          <SelectContent className='z-[999]'>
            <SelectItem value='ALL'>All Types</SelectItem>
            <SelectItem value='MONTHLY'>Monthly</SelectItem>
            <SelectItem value='BONUS'>Bonus</SelectItem>
            <SelectItem value='OVERTIME'>Overtime</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Type Filter */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-muted-foreground'>
          Payment Type
        </label>
        <Select
          value={params.payment_type}
          onValueChange={(payment_type) =>
            setParams((prev) => ({
              ...prev,
              payment_type,
              page: '1',
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select payment type' />
          </SelectTrigger>
          <SelectContent className='z-[999]'>
            <SelectItem value='ALL'>All Payment Types</SelectItem>
            <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
            <SelectItem value='BKASH'>bKash</SelectItem>
            <SelectItem value='NAGAD'>Nagad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Filters */}
      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium  text-muted-foreground'>
            Date Filter
          </label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by date' />
            </SelectTrigger>
            <SelectContent className='z-[999]'>
              <SelectItem value='ALL'>All Time</SelectItem>
              <SelectItem value='MONTH_YEAR'>Month & Year</SelectItem>
              <SelectItem value='DATE'>Specific Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateFilter === 'MONTH_YEAR' && (
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Month
              </label>
              <Select
                value={params.month}
                onValueChange={(month) =>
                  setParams((prev) => ({
                    ...prev,
                    month,
                    page: '1',
                    date: '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select month' />
                </SelectTrigger>
                <SelectContent className='z-[999]'>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {dayjs().month(i).format('MMMM')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Year
              </label>
              <Select
                value={params.year}
                onValueChange={(year) =>
                  setParams((prev) => ({
                    ...prev,
                    year,
                    page: '1',
                    date: '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select year' />
                </SelectTrigger>
                <SelectContent className='z-[999]'>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {dateFilter === 'DATE' && (
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Date
            </label>
            <Input
              type='date'
              value={params.date}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  date: e.target.value,
                  year: '',
                  month: '',
                  page: '1',
                }))
              }
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4 border-t'>
        <Button variant='outline' onClick={clearFilters} className='flex-1'>
          <X className='h-4 w-4 mr-2' />
          Clear All
        </Button>
        <Button onClick={applyFilters} className='flex-1'>
          <Filter className='h-4 w-4 mr-2' />
          Apply Filters
        </Button>
      </div>

      {/* Active Filters Summary */}
      <div className='pt-4 border-t'>
        <h4 className='text-sm font-medium text-gray-700 mb-2'>
          Active Filters:
        </h4>
        <div className='flex flex-wrap gap-2'>
          {params.search && (
            <div className='bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs'>
              Search: {params.search}
            </div>
          )}
          {params.status && params.status !== 'ALL' && (
            <div className='bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs'>
              Status:{' '}
              {
                salaryStatusConvert[
                  params.status as keyof typeof salaryStatusConvert
                ]
              }
            </div>
          )}
          {params.salary_type && params.salary_type !== 'ALL' && (
            <div className='bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs'>
              Type:{' '}
              {
                salaryTypeConvert[
                  params.salary_type as keyof typeof salaryTypeConvert
                ]
              }
            </div>
          )}
          {params.payment_type && params.payment_type !== 'ALL' && (
            <div className='bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs'>
              Payment:{' '}
              {
                paymentTypeConvert[
                  params.payment_type as keyof typeof paymentTypeConvert
                ]
              }
            </div>
          )}
          {params.month && (
            <div className='bg-pink-100 text-pink-800 px-2 py-1 rounded-md text-xs'>
              Month:{' '}
              {dayjs()
                .month(parseInt(params.month) - 1)
                .format('MMMM')}
            </div>
          )}
          {params.year && (
            <div className='bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs'>
              Year: {params.year}
            </div>
          )}
          {params.date && (
            <div className='bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs'>
              Date: {dayjs(params.date).format('DD MMM YYYY')}
            </div>
          )}
          {!params.search &&
            (!params.status || params.status === 'ALL') &&
            (!params.salary_type || params.salary_type === 'ALL') &&
            (!params.payment_type || params.payment_type === 'ALL') &&
            !params.month &&
            !params.year &&
            !params.date && (
              <div className='text-gray-500 text-xs italic'>
                No filters applied
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
