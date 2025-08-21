'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import dayjs from 'dayjs';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';

type ParamsType = {
  search: string;
  page: string;
  status: string;
  paper_type: string;
  due_date: string;
  due_month: string;
  due_year: string;
  task_create: string;
  task_create_year: string;
  task_create_month: string;
};

type MyTasksFilterProps = {
  params: ParamsType;
  setParams: React.Dispatch<React.SetStateAction<ParamsType>>;
  setOpenTaskFilter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MyTasksFilter({
  setParams,
  params,
  setOpenTaskFilter,
}: MyTasksFilterProps) {
  const [dateFilter, setDateFilter] = useState('ALL');
  const [taskCreateDate, setTaskCreateDate] = useState('ALL');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const clearFilters = () => {
    setParams({
      search: '',
      page: '1',
      status: '',
      paper_type: '',
      due_date: '',
      due_month: '',
      due_year: '',
      task_create: '',
      task_create_year: '',
      task_create_month: '',
    });
    setDateFilter('ALL');
    setTaskCreateDate('ALL');
  };

  const applyFilters = () => {
    setOpenTaskFilter(false);
  };
  return (
    <div className='space-y-5'>
      <div className='flex md:flex-row flex-col gap-4'>
        <Select
          value={params.paper_type}
          onValueChange={(value) => {
            setParams((prev) => ({
              ...prev,
              paper_type: value === 'ALL' ? '' : value,
            }));
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Filter by paper type' />
          </SelectTrigger>
          <SelectContent className='z-[9999]'>
            <SelectItem value='ALL'>All Type</SelectItem>
            <SelectItem value='CONFERENCE'>Conference</SelectItem>
            <SelectItem value='SURVEY'>Survey</SelectItem>
            <SelectItem value='JOURNAL'>Journal</SelectItem>
          </SelectContent>
        </Select>
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
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent className='z-[999]'>
          <SelectItem value='ALL'>All Tasks Status</SelectItem>
          <SelectItem value='PENDING'>Pending</SelectItem>
          <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
          <SelectItem value='COMPLETED'>Completed</SelectItem>
        </SelectContent>
      </Select>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Duration Date Filter
          </label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by date' />
            </SelectTrigger>
            <SelectContent className='z-[999]'>
              <SelectItem value='ALL'>Due Date Time</SelectItem>
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
                value={params.due_month}
                onValueChange={(month) =>
                  setParams((prev) => ({
                    ...prev,
                    due_month: month,
                    page: '1',
                    due_date: '',
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
                value={params.due_year}
                onValueChange={(year) =>
                  setParams((prev) => ({
                    ...prev,
                    due_year: year,
                    page: '1',
                    due_date: '',
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
              value={params.due_date}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  due_date: e.target.value,
                  due_year: '',
                  due_month: '',
                  page: '1',
                }))
              }
            />
          </div>
        )}
      </div>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Task Create Date Filter
          </label>
          <Select value={taskCreateDate} onValueChange={setTaskCreateDate}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by date' />
            </SelectTrigger>
            <SelectContent className='z-[999]'>
              <SelectItem value='ALL'>Task Create Date</SelectItem>
              <SelectItem value='TASK_CREATE_MONTH_YEAR'>
                Task Create Month & Year
              </SelectItem>
              <SelectItem value='TASK_CREATE_DATE'>
                Task Create Specific Date
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {taskCreateDate === 'TASK_CREATE_MONTH_YEAR' && (
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Month
              </label>
              <Select
                value={params.task_create_month}
                onValueChange={(month) =>
                  setParams((prev) => ({
                    ...prev,
                    task_create_month: month,
                    page: '1',
                    task_create_date: '',
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
                value={params.task_create_year}
                onValueChange={(year) =>
                  setParams((prev) => ({
                    ...prev,
                    task_create_year: year,
                    page: '1',
                    task_create_date: '',
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

        {taskCreateDate === 'TASK_CREATE_DATE' && (
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Date
            </label>
            <Input
              type='date'
              value={params.task_create}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  task_create: e.target.value,
                  task_create_year: '',
                  task_create_month: '',
                  page: '1',
                }))
              }
            />
          </div>
        )}
      </div>
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
          {params.status && params.status !== 'ALL' && (
            <div className='bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs'>
              Type: {params.status}
            </div>
          )}
          {params.paper_type && params.paper_type !== 'ALL' && (
            <div className='bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs'>
              Payment: {params.paper_type}
            </div>
          )}
          {params.due_month && (
            <div className='bg-pink-100 text-pink-800 px-2 py-1 rounded-md text-xs'>
              Due Month:{' '}
              {dayjs()
                .month(parseInt(params.due_month) - 1)
                .format('MMMM')}
            </div>
          )}
          {params.due_year && (
            <div className='bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs'>
              Due Year: {params.due_year}
            </div>
          )}
          {params.due_date && (
            <div className='bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs'>
              Date: {dayjs(params.due_date).format('DD MMM YYYY')}
            </div>
          )}
          {params.task_create_month && (
            <div className='bg-pink-100 text-pink-800 px-2 py-1 rounded-md text-xs'>
              Create Month:{' '}
              {dayjs()
                .month(parseInt(params.task_create_month) - 1)
                .format('MMMM')}
            </div>
          )}
          {params.task_create_year && (
            <div className='bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs'>
              Create Year: {params.task_create_year}
            </div>
          )}
          {params.task_create && (
            <div className='bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs'>
              Date: {dayjs(params.task_create).format('DD MMM YYYY')}
            </div>
          )}
          {!params.search &&
            (!params.status || params.status === 'ALL') &&
            (!params.paper_type || params.paper_type === 'ALL') &&
            !params.due_date &&
            !params.due_month &&
            !params.due_year &&
            !params.task_create &&
            !params.task_create_year &&
            !params.task_create_month && (
              <div className='text-gray-500 text-xs italic'>
                No filters applied
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
