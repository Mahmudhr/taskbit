'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { exportTasksToXLSX } from '@/server/tasks/export-tasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ExportTasksForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState<'date-range' | 'month-year'>(
    'date-range'
  );
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [month, setMonth] = useState<string>();
  const [year, setYear] = useState<string>();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleExport = async () => {
    try {
      setIsLoading(true);

      let params = {};
      if (exportType === 'date-range' && startDate && endDate) {
        params = { startDate, endDate };
      } else if (exportType === 'month-year' && month && year) {
        params = { month: parseInt(month), year: parseInt(year) };
      } else {
        alert('Please select all required fields');
        return;
      }

      const buffer = await exportTasksToXLSX(params);

      // Create a Blob from the buffer
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link and trigger click
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export tasks');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4 p-4'>
      <div className='space-y-2'>
        <h3 className='text-lg font-medium'>Export Tasks</h3>
        <p className='text-sm text-muted-foreground'>
          Export tasks to Excel format based on date range or month/year
        </p>
      </div>

      <div className='space-y-4'>
        <Select
          value={exportType}
          onValueChange={(value: 'date-range' | 'month-year') =>
            setExportType(value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select export type' />
          </SelectTrigger>
          <SelectContent className='z-[999]'>
            <SelectItem value='date-range'>Date Range</SelectItem>
            <SelectItem value='month-year'>Month & Year</SelectItem>
          </SelectContent>
        </Select>

        {exportType === 'date-range' ? (
          <div className='flex items-center gap-4'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0 z-[999]' align='start'>
                <Calendar
                  mode='single'
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0 z-[999]' align='start'>
                <Calendar
                  mode='single'
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className='flex items-center gap-4'>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='Select month' />
              </SelectTrigger>
              <SelectContent className='z-[999]'>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='Select year' />
              </SelectTrigger>
              <SelectContent className='z-[999]'>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleExport} disabled={isLoading} className='w-full'>
          {isLoading ? 'Exporting...' : 'Export Tasks'}
        </Button>
      </div>
    </div>
  );
}
