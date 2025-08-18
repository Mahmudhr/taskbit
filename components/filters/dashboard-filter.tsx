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
import { usePathname, useRouter } from 'next/navigation';

type ParamsType = {
  month: string;
  year: string;
  date: string;
};

type SalaryFilterProps = {
  params: ParamsType;
  setParams: React.Dispatch<React.SetStateAction<ParamsType>>;
  setOpenFilter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DashboardFilter({
  params,
  setParams,
  setOpenFilter,
}: SalaryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dateFilter, setDateFilter] = useState('ALL');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const clearFilters = () => {
    setParams({ month: '', year: '', date: '' });
    setDateFilter('ALL');

    setTimeout(() => {
      router.replace(pathname);
    }, 0);
  };

  const applyFilters = () => {
    setOpenFilter(false);
  };
  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
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
      {/* <div className='pt-4 border-t'>
        <h4 className='text-sm font-medium text-gray-700 mb-2'>
          Active Filters:
        </h4>

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
        {!params.month && !params.year && !params.date && (
          <div className='text-gray-500 text-xs italic'>No filters applied</div>
        )}
      </div> */}
      <div className='pt-4 border-t'>
        <h4 className='text-sm font-medium text-gray-700 mb-2'>
          Active Filters:
        </h4>
        <div className='flex flex-wrap gap-2'>
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
          {!params.month && !params.year && !params.date && (
            <div className='text-gray-500 text-xs italic'>
              No filters applied
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
