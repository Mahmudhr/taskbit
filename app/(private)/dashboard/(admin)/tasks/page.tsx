'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  EllipsisVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AlertModal from '@/components/alert-modal';
import CreateTaskForm from '@/components/forms/create-task-form';
import {
  cn,
  generateQueryString,
  getErrorMessage,
  taskStatusConvert,
} from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTask } from '@/hooks/use-task';
import { useDebouncedCallback } from 'use-debounce';
import UpdateTaskForm from '@/components/forms/update-task-from';
import { TaskType } from '@/types/common';
import TaskTableSkeleton from '@/components/skeletons/task-table-skeleton';
import TaskCardSkeleton from '@/components/skeletons/task-card-skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmModal from '@/components/confirm-modal';
import { toast } from 'sonner';
import CreatePaymentForm from '@/components/forms/create-payment-form';
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

const getPaymentStatusBadge = (amount: number) => {
  if (amount > 0) {
    return <Badge variant='destructive'>Due</Badge>;
  } else {
    return <Badge variant='default'>Paid</Badge>;
  }
};

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [taskOpen, setTaskOpen] = useState(false);
  const [updateTaskOpen, setUpdateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [taskId, setTaskId] = useState<number | null>(null);
  const [openPayment, setOpenPayment] = useState(false);
  const router = useRouter();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    date: searchParams.get('date') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchTasks, fetchTasksMutation, deleteTaskAsync } =
    useTask(queryString);

  const handleDeleTask = () => {
    if (taskId === null) return;
    startTransition(() => {
      toast.promise(deleteTaskAsync(taskId), {
        loading: 'Deleting user...',
        success: () => {
          setConfirmModal(false);
          return 'Successfully Task Deleted';
        },
        error: (err) => getErrorMessage(err) || 'Something went wrong!',
      });
    });
  };

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task);
    setUpdateTaskOpen(true);
  };

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>All Tasks</h1>
        <Button onClick={() => setTaskOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Task
        </Button>
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
                placeholder='Search tasks...'
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
                  status: value,
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
              value={params.date}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  date: value,
                }));
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by time' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Time</SelectItem>
                <SelectItem value='last-day'>Last Day</SelectItem>
                <SelectItem value='last-week'>Last Week</SelectItem>
                <SelectItem value='last-month'>Last Month</SelectItem>
                <SelectItem value='last-6months'>Last 6 Months</SelectItem>
                <SelectItem value='last-year'>Last Year</SelectItem>
              </SelectContent>
            </Select>
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
            {params.date && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {params.date}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      date: '',
                    }));
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
          <CardTitle>Tasks List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            {!fetchTasksMutation.isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Task Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className='text-center'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchTasks &&
                    fetchTasks.data.map((task, index) => (
                      <TableRow key={task.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className='font-medium'>
                          {task.title}
                        </TableCell>
                        <TableCell>
                          {dayjs(task.duration).format('DD-MM-YYYY')}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <span>৳ {task.amount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getPaymentStatusBadge(task.amount)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {task.assignedTo?.name
                            ? task.assignedTo.name.length > 20
                              ? task.assignedTo.name.slice(0, 20) + '...'
                              : task.assignedTo.name
                            : ''}
                        </TableCell>
                        <TableCell>
                          {dayjs(task.createdAt).format('DD-MM-YYYY')}
                        </TableCell>
                        <TableCell className='flex gap-2 justify-center'>
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
                                    setOpenPayment(true);
                                    setTaskId(task.id);
                                  }}
                                  disabled={task.amount === 0}
                                >
                                  Make Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditTask(task)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTaskId(task.id);
                                    setConfirmModal(true);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {/* <Button variant='outline' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button> */}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <TaskTableSkeleton />
            )}
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {!fetchTasksMutation.isLoading ? (
              fetchTasks &&
              fetchTasks.data.map((task, index) => (
                <Card key={task.id} className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-muted-foreground'>
                        #{index + 1}
                      </span>
                      <h3 className='font-medium'>{task.title}</h3>
                    </div>
                    <div className='flex gap-2'>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical className='w-5 h-5 text-gray-600' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Make Payment</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setTaskId(task.id);
                              setConfirmModal(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Due Date:</span>
                      <span>
                        {task?.duration
                          ? typeof task.duration === 'string'
                            ? task.duration
                            : `${task.duration
                                .getDate()
                                .toString()
                                .padStart(2, '0')}-${(
                                task.duration.getMonth() + 1
                              )
                                .toString()
                                .padStart(
                                  2,
                                  '0'
                                )}-${task.duration.getFullYear()}`
                          : ''}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Amount:</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>৳ {task.amount}</span>
                        {getPaymentStatusBadge(task.amount)}
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Assignee:</span>
                      <span>
                        {task.assignedTo?.name
                          ? task.assignedTo.name.length > 20
                            ? task.assignedTo.name.slice(0, 20) + '...'
                            : task.assignedTo.name
                          : ''}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Status:</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Link:</span>
                      <a
                        href={task.link || ''}
                        className='text-blue-600 hover:underline text-sm'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View Link
                      </a>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <TaskCardSkeleton />
            )}
          </div>
          {fetchTasks && fetchTasks?.meta.count > 0 && (
            <div className='flex items-center justify-between space-x-2 py-4'>
              <div className='text-sm text-muted-foreground'>
                Showing 1 to {fetchTasks?.data.length} of{' '}
                {fetchTasks?.meta.count} results
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
                    +params.page === (fetchTasks && fetchTasks.meta.totalPages)
                  }
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
        isOpen={taskOpen}
        setIsOpen={setTaskOpen}
        title='Create new task'
        description=' '
      >
        <CreateTaskForm setIsOpen={setTaskOpen} />
      </AlertModal>
      <AlertModal
        isOpen={updateTaskOpen}
        setIsOpen={setUpdateTaskOpen}
        title='Update Task'
        description=' '
      >
        <UpdateTaskForm setIsOpen={setUpdateTaskOpen} data={selectedTask} />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your user '
        onClick={handleDeleTask}
      />
      <AlertModal
        isOpen={openPayment}
        setIsOpen={setOpenPayment}
        title='Create new payment'
        description=' '
      >
        <CreatePaymentForm setIsOpen={setOpenPayment} taskId={taskId} />
      </AlertModal>
    </div>
  );
}
