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
import { useTransition } from 'react';
import { useSearchUser, SearchUserOption } from '@/hooks/use-search-user';
import { Card } from '../ui/card';
import { useState } from 'react';
import {
  allTaskStatus,
  generateUniqueId,
  getErrorMessage,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import { useTask } from '@/hooks/use-task';
import { Loader2Icon, X } from 'lucide-react';
import { PaperType, TaskStatus } from '@prisma/client';
import { SearchClientOption, useClient } from '@/hooks/use-client';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { UserSearchAndSelect } from '../ui/user-search-and-select';
import { DatePicker } from '../ui/date-picker';
import { useSession } from 'next-auth/react';

const FormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  link: z
    .string()
    .url({ message: 'Must be a valid URL' })
    .optional()
    .or(z.literal('')),
  // Allow 0 for CO_ADMIN, check in onSubmit
  amount: z.coerce.number().min(0, { message: 'Amount must be 0 or greater' }),
  status: z.nativeEnum(TaskStatus),
  paper_type: z.nativeEnum(PaperType),
  assignedUserIds: z.array(z.number()).optional(),
  clientId: z.coerce.number().optional(),
  duration: z.date().optional().nullable(),
  startDate: z.date().optional().nullable(),
  unique_id: z.string().min(2).max(100),
});

type CreateTaskFormProps = {
  setIsOpen: (open: boolean) => void;
};

export default function CreateTaskForm({ setIsOpen }: CreateTaskFormProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const { createTaskMutationAsync } = useTask();
  const [selectedUsers, setSelectedUsers] = useState<SearchUserOption[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<SearchClientOption | null>(null);
  const { search } = useSearchUser();
  const { searchClients } = useClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      status: TaskStatus.PENDING,
      assignedUserIds: [],
      clientId: 0,
      duration: null,
      startDate: null,
    },
  });

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

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (session?.user.role !== 'CO_ADMIN' && data.amount === 0) {
      form.setError('amount', { message: 'Amount must be greater than 0' });
      return;
    }
    const payload = {
      ...data,
      clientId: data.clientId === 0 ? undefined : data.clientId,
      duration: data.duration ? new Date(data.duration) : new Date(),
      assignedUserIds: data.assignedUserIds || [],
    };

    startTransition(() => {
      toast.promise(createTaskMutationAsync(payload), {
        loading: 'Creating Task...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Task Created';
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
                  placeholder='Tell us a little bit about the task'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-2'>
          <FormLabel>Assign To Users</FormLabel>
          <UserSearchAndSelect
            placeholder='Search user by name or email...'
            search={search}
            onSelect={(option) => addUser(option)}
          />
        </div>

        {/* Selected Users Display */}
        {selectedUsers.length > 0 && (
          <div className='mt-4 space-y-2'>
            <div className='text-sm font-medium text-muted-foreground'>
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
          <div className='mt-2 text-sm text-muted-foreground italic'>
            No users assigned yet. Search and select users above.
          </div>
        )}

        <div>
          <div className='space-y-2'>
            <FormLabel>Client</FormLabel>
            <FormField
              control={form.control}
              name='clientId'
              render={({ field }) => (
                <UserSearchAndSelect
                  placeholder='Search user by name or email...'
                  search={async (query: string) => {
                    const results = await searchClients(query);
                    return results.map((option) => ({
                      ...option,
                      user: {
                        ...option.user,
                        email: option.user.email ?? '',
                      },
                    }));
                  }}
                  onSelect={(option) => {
                    setSelectedClient(option);
                    field.onChange(option ? option.value : 0);
                  }}
                />
              )}
            />
          </div>

          <div>
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
                    form.setValue('clientId', 0);
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </div>
              </Card>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name='unique_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique ID</FormLabel>
              <div className='flex gap-2 w-full'>
                <FormControl>
                  <Input
                    className='w-full'
                    placeholder='Enter unique ID or generate'
                    {...field}
                  />
                </FormControl>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    const id = generateUniqueId();
                    field.onChange(id);
                  }}
                >
                  Generate
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {session?.user.role !== 'CO_ADMIN' && (
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
        )}

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
                  {allTaskStatus.map((status) => (
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
          name='startDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={field.onChange}
                  placeholder='Select assigned date'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='duration'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={field.onChange}
                  placeholder='Select delivery date'
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
          Create Task
        </Button>
      </form>
    </Form>
  );
}
