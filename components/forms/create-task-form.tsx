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
import ReactAsyncSelect from '../react-async-select';
import { Card } from '../ui/card';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';
import { useTask } from '@/hooks/use-task';
import { Loader2Icon } from 'lucide-react';
import { TaskStatus } from '@prisma/client';
// import { useCreateTask } from '@/hooks/use-task';

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
  assignedToId: z
    .string()
    .min(1, { message: 'Please select a user to assign' }),
  duration: z.string().optional(),
});

type CreateTaskFormProps = {
  setIsOpen: (open: boolean) => void;
};

export default function CreateTaskForm({ setIsOpen }: CreateTaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const { createTaskMutationAsync } = useTask();
  const [selectedUser, setSelectedUser] = useState<SearchUserOption | null>(
    null
  );
  const { search } = useSearchUser();
  // const createTaskMutation = useCreateTask();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      status: TaskStatus.PENDING,
      assignedToId: '',
      duration: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = {
      ...data,
      duration: data.duration ? new Date(data.duration) : new Date(),
    };

    startTransition(() => {
      toast.promise(createTaskMutationAsync(payload), {
        loading: 'Creating user...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully created user';
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
                <Input
                  className='w-full'
                  placeholder='Enter description (optional)'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='assignedToId'
          render={({ field }) => (
            <FormItem>
              <ReactAsyncSelect<SearchUserOption>
                label='Assign To'
                name='assignedToId'
                loadOptions={async (inputValue: string) => {
                  const users = await search(inputValue);
                  return users.map((user: SearchUserOption['user']) => ({
                    label: `${user.name} (${user.email})`,
                    value: String(user.id),
                    user,
                  }));
                }}
                onChange={(option) => {
                  field.onChange(option ? option.value : '');
                  setSelectedUser(option);
                }}
                isClearable
                placeholder='Search user by name or email...'
              />
              <FormMessage />
              {selectedUser && (
                <Card className='mt-4 p-4 break-words whitespace-pre-line w-full'>
                  <div className='font-semibold break-words whitespace-pre-line'>
                    {selectedUser.user.name}
                  </div>
                  <div className='text-xs text-gray-600 break-words whitespace-pre-line'>
                    {selectedUser.user.email}
                  </div>
                  {/* Add more user details if needed */}
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
                      {status.replace('_', ' ')}
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
