'use client';

import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { useTransition, useState, useEffect } from 'react';
import { useSearchUser, SearchUserOption } from '@/hooks/use-search-user';
import ReactAsyncSelect from '../react-async-select';
import { Card } from '../ui/card';
import {
  formatDateToString,
  getErrorMessage,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import { useTask } from '@/hooks/use-task';
import { Loader2Icon, X, Users } from 'lucide-react';
import { PaperType, TaskStatus } from '@prisma/client';
import { TaskType } from '@/types/common';
import { useSession } from 'next-auth/react';
import { SearchClientOption, useClient } from '@/hooks/use-client';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

const FormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  link: z
    .string()
    .url({ message: 'Must be a valid URL' })
    .optional()
    .or(z.literal('')),
  amount: z.coerce
    .number()
    .min(1, { message: 'Amount must be greater than 0' }),
  status: z.nativeEnum(TaskStatus),
  paper_type: z.nativeEnum(PaperType),
  assignedUserIds: z.array(z.number()).optional(),
  clientId: z.coerce.number().optional(),
  duration: z.string().optional(),
  startDate: z.date().optional(),
});

type UpdateTaskFormProps = {
  setIsOpen: (open: boolean) => void;
  data?: TaskType | null;
};

export default function UpdateTaskForm({
  setIsOpen,
  data,
}: UpdateTaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const { updateTaskMutationAsync } = useTask();
  const [selectedUsers, setSelectedUsers] = useState<SearchUserOption[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<SearchClientOption | null>(null);
  const { data: session } = useSession();
  const { search } = useSearchUser();
  const { searchClients } = useClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      link: data?.link || '',
      amount: data?.amount || 0,
      status: data?.status || TaskStatus.PENDING,
      assignedUserIds: [],
      clientId: data?.clientId || 0,
      duration: data?.duration
        ? new Date(data.duration).toISOString().split('T')[0]
        : '',
      paper_type: data?.paper_type || 'CONFERENCE',
      startDate: data?.startDate || undefined,
    },
  });

  useEffect(() => {
    if (
      data?.assignedUsers &&
      Array.isArray(data.assignedUsers) &&
      data.assignedUsers.length > 0
    ) {
      const usersToSelect: SearchUserOption[] = data.assignedUsers.map(
        (user) => ({
          label: `${user.name} (${user.email})`,
          value: user.id,
          user: user,
        })
      );
      setSelectedUsers(usersToSelect);
      const userIds = usersToSelect.map((u) => u.value);
      form.setValue('assignedUserIds', userIds);
    }
  }, [data, form]);

  // Initialize selected client
  useEffect(() => {
    if (data?.client) {
      setSelectedClient({
        label: `${data.client.name} (${data.client.email || ''})`,
        value: data.client.id,
        user: data.client,
      });
    }
  }, [data]);

  const addUser = (user: SearchUserOption) => {
    const isAlreadySelected = selectedUsers.some((u) => u.value === user.value);
    if (!isAlreadySelected) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);

      const userIds = newSelectedUsers.map((u) => u.value);
      form.setValue('assignedUserIds', userIds);
    }
  };

  const removeUser = (userId: number) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.value !== userId);
    setSelectedUsers(newSelectedUsers);

    const userIds = newSelectedUsers.map((u) => u.value);
    form.setValue('assignedUserIds', userIds);
  };

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;

    const payload = {
      id: data.id,
      data: {
        ...formData,
        clientId: formData.clientId === 0 ? undefined : formData.clientId,
        duration: formData.duration ? new Date(formData.duration) : new Date(),
        assignedUserIds: formData.assignedUserIds || [],
      },
    };

    startTransition(() => {
      toast.promise(updateTaskMutationAsync(payload), {
        loading: 'Updating task...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Task Updated';
        },
        error: (err) => getErrorMessage(err),
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter task title'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Leave a description (optional)'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Assign To Users
          </FormLabel>

          {/* User Search */}
          <ReactAsyncSelect<SearchUserOption>
            label=''
            name='userSearch'
            loadOptions={async (inputValue: string) => {
              const options = await search(inputValue);
              const currentUserEmail = session?.user?.email;
              return options.filter(
                (option) =>
                  option.user.email !== currentUserEmail &&
                  !selectedUsers.some((u) => u.value === option.value)
              );
            }}
            onChange={(option) => {
              if (option) {
                addUser(option);
              }
            }}
            value={null} // Always null to allow multiple selections
            isClearable
            placeholder='Search user by name or email...'
          />

          <FormMessage />

          {/* Selected Users Display */}
          {selectedUsers.length > 0 && (
            <div className='mt-4 space-y-2'>
              <div className='text-sm font-medium text-gray-700'>
                Selected Users ({selectedUsers.length}):
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.value}
                    variant='secondary'
                    className='flex items-center gap-2 px-3 py-1'
                  >
                    <div className='flex flex-col items-start'>
                      <span className='font-medium'>{user.user.name}</span>
                      <span className='text-xs opacity-70'>
                        {user.user.email}
                      </span>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground'
                      onClick={() => removeUser(user.value)}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedUsers.length === 0 && (
            <div className='mt-2 text-sm text-gray-500 italic'>
              No users assigned yet. Search and select users above.
            </div>
          )}
        </FormItem>
        <FormField
          control={form.control}
          name='clientId'
          render={({ field }) => (
            <FormItem>
              <ReactAsyncSelect<SearchClientOption>
                label='Client'
                name='clientId'
                value={selectedClient}
                loadOptions={async (inputValue: string) => {
                  const options = await searchClients(inputValue);
                  return options;
                }}
                onChange={(option) => {
                  field.onChange(option ? option.value : 0);
                  setSelectedClient(option);
                }}
                isClearable
                placeholder='Search client by name or email...'
              />
              <FormMessage />
              {selectedClient && (
                <Card className='mt-4 p-4 break-words whitespace-pre-line w-full flex justify-between'>
                  <div>
                    <div className='font-semibold break-words whitespace-pre-line text-left'>
                      {selectedClient.user.name}
                    </div>
                    <div className='text-xs text-gray-600 break-all text-left'>
                      {selectedClient.user.email}
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setSelectedClient(null);
                      field.onChange(0);
                      form.setValue('clientId', 0);
                    }}
                  >
                    <X className='w-4 h-4 cursor-pointer' />
                  </div>
                </Card>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  type='number'
                  placeholder='Enter amount'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {Object.values(TaskStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {
                        taskStatusConvert[
                          status as keyof typeof taskStatusConvert
                        ]
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='paper_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paper Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select paper type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {Object.values(PaperType).map((status) => (
                    <SelectItem key={status} value={status}>
                      {
                        paperTypeConvert[
                          status as keyof typeof paperTypeConvert
                        ]
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='duration'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  type='date'
                  placeholder='Select date'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='startDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  type='date'
                  placeholder='Select start date'
                  value={formatDateToString(field.value)}
                  onChange={(e) => {
                    const dateValue = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    field.onChange(dateValue);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isPending}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Update Task
        </Button>
      </form>
    </Form>
  );
}
