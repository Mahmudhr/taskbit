'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import dayjs from 'dayjs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';

type ParamsType = {
  search: string;
  page: string;
  status: string;
  payment_type: string;
  month: string;
  year: string;
  date: string;
};

type PaymentFilterProps = {
  params: ParamsType;
  setParams: React.Dispatch<React.SetStateAction<ParamsType>>;
  setOpenPaymentFilter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PaymentFilter({
  params,
  setParams,
  setOpenPaymentFilter,
}: PaymentFilterProps) {
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const clearFilters = () => {
    setParams({
      search: '',
      page: '1',
      status: '',
      payment_type: '',
      date: '',
      month: '',
      year: '',
    });
    setDateFilter('ALL');
  };

  const applyFilters = () => {
    setOpenPaymentFilter(false);
  };

  return (
    <div className='space-y-4'>
      <Select
        value={params.status}
        onValueChange={(value) => {
          setParams((prev) => ({
            ...prev,
            status: value === 'ALL' ? '' : value,
          }));
        }}
      >
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Payments Status' />
        </SelectTrigger>
        <SelectContent className='z-[999]'>
          <SelectItem value='ALL'>All Payments</SelectItem>
          <SelectItem value='PENDING'>Pending</SelectItem>
          <SelectItem value='COMPLETED'>Completed</SelectItem>
          <SelectItem value='FAILED'>Failed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={params.payment_type}
        onValueChange={(value) => {
          setParams((prev) => ({
            ...prev,
            payment_type: value === 'ALL' ? '' : value,
          }));
        }}
      >
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Payments Types' />
        </SelectTrigger>
        <SelectContent className='z-[999]'>
          <SelectItem value='ALL'>Payment Type</SelectItem>
          <SelectItem value='BKASH'>Bkash</SelectItem>
          <SelectItem value='NAGAD'>Nagad</SelectItem>
          <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
        </SelectContent>
      </Select>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by date' />
            </SelectTrigger>
            <SelectContent className='z-[999]'>
              <SelectItem value='ALL'>Date Time</SelectItem>
              <SelectItem value='DUE_MONTH_YEAR'>Month & Year</SelectItem>
              <SelectItem value='DUE_DATE'>Specific Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateFilter === 'DUE_MONTH_YEAR' && (
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
                    month: month,
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
                    year: year,
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

        {dateFilter === 'DUE_DATE' && (
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
          {params.status && params.status !== 'ALL' && (
            <div className='bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs'>
              Status: {params.status}
            </div>
          )}

          {params.payment_type && params.payment_type !== 'ALL' && (
            <div className='bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs'>
              Payment Type: {params.payment_type}
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

          {!params.search &&
            (!params.status || params.status === 'ALL') &&
            (!params.payment_type || params.payment_type === 'ALL') &&
            !params.month &&
            !params.date &&
            !params.month &&
            !params.year && (
              <div className='text-gray-500 text-xs italic'>
                No filters applied
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
