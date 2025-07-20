'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  ChevronDownIcon,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserTask } from '@/hooks/use-user-task';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn, generateQueryString, taskStatusConvert } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import { TaskType } from '@/types/common';
import TaskTableSkeleton from '@/components/skeletons/task-table-skeleton';
import TaskCardSkeleton from '@/components/skeletons/task-card-skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import dayjs from 'dayjs';

const getStatusBadge = (status: string) => {
  const variants = {
    PENDING: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    SUBMITTED: 'bg-amber-100 text-amber-800 hover:bg-amber-200 ',
    COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200',
  } as const;
  return (
    <Badge className={cn(variants[status as keyof typeof variants])}>
      {taskStatusConvert[status as keyof typeof taskStatusConvert]}
    </Badge>
  );
};

export default function MyTasksPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const email = session?.user?.email || undefined;
  // const [statusFilter, setStatusFilter] = useState('all');
  // const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [taskDateOpen, setTaskDateOpen] = useState(false);
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);
  const [createdDateOpen, setCreatedDateOpen] = useState(false);
  const [createdDate, setCreatedDate] = useState<Date | undefined>(undefined);

  const router = useRouter();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    due_date: searchParams.get('due_date') || '',
    task_create: searchParams.get('task_create') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchUserTasks, fetchUserTasksMutation } = useUserTask(
    email,
    queryString
  );
  const tasks = fetchUserTasks;
  const loading = fetchUserTasksMutation.isLoading;
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
        <h1 className='text-xl md:text-3xl font-bold'>My Tasks</h1>
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
                placeholder='Search my tasks...'
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
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                <SelectItem value='SUBMITTED'>Submitted</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className='flex flex-col gap-3'>
              <Popover open={taskDateOpen} onOpenChange={setTaskDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    id='date'
                    className='w-48 justify-between font-normal'
                  >
                    {taskDate ? taskDate.toLocaleDateString() : 'Due date'}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto overflow-hidden p-0'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={taskDate}
                    captionLayout='dropdown'
                    onSelect={(date) => {
                      setTaskDate(date);
                      setParams((prev) => ({
                        ...prev,
                        due_date: date ? dayjs(date).format('YYYY-MM-DD') : '',
                      }));
                      setTaskDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className='flex flex-col gap-3'>
              <Popover open={createdDateOpen} onOpenChange={setCreatedDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    id='date'
                    className='w-48 justify-between font-normal'
                  >
                    {createdDate
                      ? createdDate.toLocaleDateString()
                      : 'Task Create date'}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto overflow-hidden p-0'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={createdDate}
                    captionLayout='dropdown'
                    onSelect={(date) => {
                      setCreatedDate(date);
                      setParams((prev) => ({
                        ...prev,
                        task_create: date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '',
                      }));

                      setCreatedDateOpen(false);
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
                  ? taskStatusConvert[
                      params.status as keyof typeof taskStatusConvert
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
            {params.task_create && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Task Create: {dayjs(params.task_create).format('DD-MM-YYYY')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_create: '',
                      page: '1',
                    }));
                    setTaskDate(undefined);
                    setCreatedDate(undefined);
                  }}
                >
                  <X className='w-5 h-5' />
                </span>
              </div>
            )}
            {params.due_date && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Due Date: {dayjs(params.due_date).format('DD-MM-YYYY')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_date: '',
                      page: '1',
                    }));
                    setTaskDate(undefined);
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
          <CardTitle>My Tasks List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className='p-0'>
                      <TaskTableSkeleton />
                    </td>
                  </tr>
                ) : (
                  tasks?.data?.map((task: TaskType, index: number) => (
                    <TableRow key={task.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className='font-medium'>
                        {task.title}
                      </TableCell>
                      <TableCell>
                        {task.duration
                          ? dayjs(task.duration).format('DD-MM-YYYY')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <a
                          href={task.link || '#'}
                          className='text-blue-600 hover:underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          View Link
                        </a>
                      </TableCell>
                      <TableCell>${task.amount}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        {' '}
                        {task.createdAt
                          ? dayjs(task.createdAt).format('DD-MM-YYYY')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant='outline' size='sm'>
                          <Upload className='h-4 w-4 mr-1' />
                          Deliver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {loading ? (
              <TaskCardSkeleton />
            ) : tasks?.data?.length === 0 ? (
              <Card className='p-4 text-center'>No tasks found.</Card>
            ) : (
              tasks?.data?.map((task: TaskType, index: number) => (
                <Card key={task.id} className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-muted-foreground'>
                        #{index + 1}
                      </span>
                      <h3 className='font-medium'>{task.title}</h3>
                    </div>
                    <Button variant='outline' size='sm'>
                      <Upload className='h-4 w-4 mr-1' />
                      Deliver
                    </Button>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Due Date:</span>
                      <span>
                        {task.duration
                          ? new Date(task.duration).toLocaleDateString()
                          : '-'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Amount:</span>
                      <span className='font-medium'>${task.amount}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Status:</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Link:</span>
                      {task.link ? (
                        <a
                          href={task.link}
                          className='text-blue-600 hover:underline text-sm'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          View Link
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-sm text-muted-foreground'>
              {/* Showing 1 to {tasks.length} of {tasks.length} results */}
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
