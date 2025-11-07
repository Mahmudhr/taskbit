'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  ListFilter,
  Plus,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  clientTaskTypeConverter,
  generateQueryString,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import TaskTableSkeleton from '@/components/skeletons/task-table-skeleton';
import TaskCardSkeleton from '@/components/skeletons/task-card-skeleton';
import dayjs from 'dayjs';
import Modal from '@/components/modal';
import AlertModal from '@/components/alert-modal';
import CreateClientTaskForm from '@/components/forms/create-client-task-form';
import { useGetNewClientTasks } from '@/hooks/use-new-client';
import { ClientTaskType } from '@/types/common';
import { getStatusBadge } from '../../(admin)/tasks/page';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ClientTaskDetails from '@/components/client-task-details';
import ClientTasksFilter from '@/components/filters/client-tasks-filter';

// const getStatusBadge = (status: string) => {
//   const variants = {
//     PENDING: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
//     IN_PROGRESS: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
//     SUBMITTED: 'bg-amber-100 text-amber-800 hover:bg-amber-200 ',
//     COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200',
//   } as const;
//   return (
//     <Badge className={cn(variants[status as keyof typeof variants])}>
//       {taskStatusConvert[status as keyof typeof taskStatusConvert]}
//     </Badge>
//   );
// };

export default function ClientTasksPage() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const email = session?.user?.email || undefined;

  // const [taskId, setTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<ClientTaskType | null>(null);
  // const [openTask, setOpenTask] = useState(false);
  const [openTaskDetails, setOpenTaskDetails] = useState(false);
  const [myTaskFilterOpen, setMyTaskFilterOpen] = useState(false);

  const router = useRouter();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    due_date: searchParams.get('due_date') || '',
    due_month: searchParams.get('due_month') || '',
    due_year: searchParams.get('due_year') || '',
    task_create: searchParams.get('task_create') || '',
    task_create_month: searchParams.get('task_create_month') || '',
    task_create_year: searchParams.get('task_create_year') || '',
    paper_type: searchParams.get('paper_type') || '',
    task_type: searchParams.get('task_type') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);

  const { fetchClientTasks, fetchClientTasksMutation } = useGetNewClientTasks(
    email,
    queryString
  );
  const loading = fetchClientTasksMutation.isLoading;
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

  const handleClickTaskDetails = (task: ClientTaskType) => {
    setSelectedTask(task);
    setOpenTaskDetails(true);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>
          Client Tasks management
        </h1>
        <Button onClick={() => setCreateTaskOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create new Task
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
                placeholder='Search my tasks...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8'
              />
            </div>
            <Button
              onClick={() => setMyTaskFilterOpen(true)}
              className='w-full sm:w-auto'
            >
              <ListFilter /> Filter
            </Button>
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
            {params.task_type && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Paper Type:{' '}
                {
                  clientTaskTypeConverter[
                    params.task_type as keyof typeof clientTaskTypeConverter
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_type: '',
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
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.due_date && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Delivery Date: {dayjs(params.due_date).format('DD-MM-YYYY')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_date: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.due_month && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Delivery Month: {dayjs(params.due_month).format('MMMM')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_month: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.due_year && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Delivery Year: {params.due_year}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_year: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.task_create_month && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Delivery Month: {dayjs(params.task_create_month).format('MMMM')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_create_month: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.task_create_year && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                Delivery Year: {params.task_create_year}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_create_year: '',
                      page: '1',
                    }));
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
          <div className='hidden md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Unique ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Task Type</TableHead>
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
                  fetchClientTasks?.data.map(
                    (task: ClientTaskType, index: number) => (
                      <TableRow key={task.id}>
                        <TableCell>#{index + 1}</TableCell>
                        <TableCell className='font-medium max-w-sm break-words'>
                          {task.title}
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {task.unique_id || '-'}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {task.amount?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {task.paid_amount?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          {task.duration
                            ? dayjs(task.duration).format('DD-MM-YYYY')
                            : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {
                            clientTaskTypeConverter[
                              task.task_type as keyof typeof clientTaskTypeConverter
                            ]
                          }
                        </TableCell>
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
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                  <EllipsisVertical className='w-4 h-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleClickTaskDetails(task)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                <DropdownMenuItem className='text-red-600'>
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>

          <div className='md:hidden block space-y-4'>
            {loading ? (
              <TaskCardSkeleton />
            ) : fetchClientTasks?.data?.length === 0 ? (
              <Card className='p-4 text-center'>No tasks found.</Card>
            ) : (
              fetchClientTasks?.data.map(
                (task: ClientTaskType, index: number) => (
                  <Card key={task.id} className='p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-start gap-2'>
                        <span className='text-sm text-muted-foreground'>
                          #{index + 1}
                        </span>
                        <h3 className='font-medium break-all'>{task.title}</h3>
                      </div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <EllipsisVertical className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleClickTaskDetails(task)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem className='text-red-600'>
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          Unique ID:
                        </span>
                        <span className='font-mono'>
                          {task.unique_id || '-'}
                        </span>
                      </div>
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>Amount:</span>
                        <span className='font-medium'>
                          ${task.amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          Delivery Date:
                        </span>
                        <span>
                          {task.duration
                            ? dayjs(task.duration).format('DD-MM-YYYY')
                            : '-'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-xs'>
                        <span className='text-muted-foreground'>Status:</span>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className='flex justify-between items-center text-xs'>
                        <span className='text-muted-foreground'>
                          Paper Type:
                        </span>
                        <span>
                          {
                            paperTypeConvert[
                              task.paper_type as keyof typeof paperTypeConvert
                            ]
                          }
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-xs'>
                        <span className='text-muted-foreground'>
                          Created At:
                        </span>
                        <span>
                          {task.createdAt
                            ? dayjs(task.createdAt).format('DD-MM-YYYY')
                            : '-'}
                        </span>
                      </div>
                      {task.description && (
                        <div className='pt-2'>
                          <span className='text-muted-foreground text-xs'>
                            Description:
                          </span>
                          <p className='text-xs mt-1 text-gray-600'>
                            {task.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              )
            )}
          </div>

          {fetchClientTasks && fetchClientTasks?.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
              <div className='text-sm text-muted-foreground'>
                Showing 1 to {fetchClientTasks?.data.length} of{' '}
                {fetchClientTasks?.meta.count} results
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
                    (fetchClientTasks && fetchClientTasks.meta.totalPages)
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
        isOpen={createTaskOpen}
        setIsOpen={setCreateTaskOpen}
        title='Create new task'
        description=' '
      >
        <CreateClientTaskForm setIsOpen={setCreateTaskOpen} />
      </AlertModal>
      <Modal
        isOpen={myTaskFilterOpen}
        setIsOpen={setMyTaskFilterOpen}
        title='Filter Tasks'
        description=' '
      >
        <ClientTasksFilter
          setParams={setParams}
          params={params}
          setOpenTaskFilter={setMyTaskFilterOpen}
        />
      </Modal>
      <Modal
        isOpen={openTaskDetails}
        setIsOpen={setOpenTaskDetails}
        title='Task Details'
        description=' '
      >
        {selectedTask && <ClientTaskDetails data={selectedTask} />}
      </Modal>
    </div>
  );
}
