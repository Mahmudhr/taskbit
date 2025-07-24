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
  ChevronDownIcon,
  X,
  EllipsisVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserTask } from '@/hooks/use-user-task';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  cn,
  generateQueryString,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import { UserTaskType } from '@/types/common';
import TaskTableSkeleton from '@/components/skeletons/task-table-skeleton';
import TaskCardSkeleton from '@/components/skeletons/task-card-skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import dayjs from 'dayjs';
import { getPaymentStatusBadge } from '../../(admin)/tasks/page';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AlertModal from '@/components/alert-modal';
import CreateTaskDeliveryForm from '@/components/forms/create-task-delivery-form';

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
  const [taskDateOpen, setTaskDateOpen] = useState(false);
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);
  const [createdDateOpen, setCreatedDateOpen] = useState(false);
  const [createdDate, setCreatedDate] = useState<Date | undefined>(undefined);
  // const [taskId, setTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<UserTaskType | null>(null);
  const [openTask, setOpenTask] = useState(false);

  const router = useRouter();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    due_date: searchParams.get('due_date') || '',
    task_create: searchParams.get('task_create') || '',
    paper_type: searchParams.get('paper_type') || '',
    payment_status: searchParams.get('payment_status') || '',
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
            <Select
              value={params.payment_status}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  payment_status: value === 'ALL' ? '' : value,
                }));
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by payment status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='due'>Due</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={params.paper_type}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  paper_type: value === 'ALL' ? '' : value,
                }));
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by paper type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Type</SelectItem>
                <SelectItem value='CONFERENCE'>Conference</SelectItem>
                <SelectItem value='SURVEY'>Survey</SelectItem>
                <SelectItem value='JOURNAL'>Journal</SelectItem>
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
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Task Status:{' '}
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
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.paper_type && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Paper Type:{' '}
                {
                  paperTypeConvert[
                    params.paper_type as keyof typeof paperTypeConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      paper_type: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
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
                  <X className='w-4 h-4 cursor-pointer' />
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
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.payment_status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Payment Status: {params.payment_status}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      payment_status: '',
                      page: '1',
                    }));
                    setTaskDate(undefined);
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
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
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paper Type</TableHead>
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
                  tasks?.data?.map((task: UserTaskType, index: number) => (
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
                        {task.link ? (
                          <Link
                            href={task.link || '#'}
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            View Link
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>৳ {task.amount}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          ৳ {task.paid ? task.amount - task.paid : task.amount}
                          {getPaymentStatusBadge(
                            task.paid ? task.amount - task.paid : task.amount
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          ৳ {task.paid}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        {
                          paperTypeConvert[
                            task.paper_type as keyof typeof paperTypeConvert
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        {task.createdAt
                          ? dayjs(task.createdAt).format('DD-MM-YYYY')
                          : '-'}
                      </TableCell>
                      <TableCell>
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
                                  setOpenTask(true);
                                  setSelectedTask(task);
                                }}
                                disabled={task.status === 'COMPLETED'}
                              >
                                Task Delivery
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
              tasks?.data?.map((task: UserTaskType, index: number) => (
                <Card key={task.id} className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-start gap-2'>
                      <span className='text-sm text-muted-foreground'>
                        #{index + 1}
                      </span>
                      <h3 className='font-medium'>{task.title}</h3>
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
                              setOpenTask(true);
                              setSelectedTask(task);
                            }}
                            disabled={task.status === 'COMPLETED'}
                          >
                            Task Delivery
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Due Date:</span>
                      <span>
                        {task.duration
                          ? dayjs(task.duration).format('DD-MM-YYYY')
                          : '-'}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Amount:</span>
                      <span className='font-medium'>৳ {task.amount}</span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Due Amount:</span>
                      <span className='font-medium'>
                        ৳ {task.paid ? task.amount - task.paid : task.amount}{' '}
                        {getPaymentStatusBadge(
                          task.paid ? task.amount - task.paid : task.amount
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>
                        Paid Amount:
                      </span>
                      <span className='font-medium'>৳ {task.paid}</span>
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Status:</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Paper Type:</span>
                      {
                        paperTypeConvert[
                          task.paper_type as keyof typeof paperTypeConvert
                        ]
                      }
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Created At:</span>
                      {task.createdAt
                        ? dayjs(task.createdAt).format('DD-MM-YYYY')
                        : '-'}
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Link:</span>
                      {task.link ? (
                        <Link
                          href={task.link || '#'}
                          className='text-blue-600 hover:underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          View Link
                        </Link>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {tasks && tasks?.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
              <div className='text-sm text-muted-foreground'>
                Showing 1 to {tasks?.data.length} of {tasks?.meta.count} results
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
                  disabled={+params.page === (tasks && tasks.meta.totalPages)}
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertModal
        isOpen={openTask}
        setIsOpen={setOpenTask}
        title='Delivered your task'
        description=' '
      >
        <CreateTaskDeliveryForm setIsOpen={setOpenTask} data={selectedTask} />
      </AlertModal>
    </div>
  );
}
