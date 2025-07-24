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
import {
  getErrorMessage,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import { useTask } from '@/hooks/use-task';
import { Loader2Icon } from 'lucide-react';
import { PaperType, TaskStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { SearchClientOption, useClient } from '@/hooks/use-client';
import { Textarea } from '../ui/textarea';

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
  assignedToId: z.coerce
    .number()
    .min(1, { message: 'Please select a user to assign' }),
  clientId: z.coerce.number().optional(),
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
  const [selectedClient, setSelectedClient] =
    useState<SearchClientOption | null>(null);
  const { search } = useSearchUser();
  const { searchClients } = useClient();
  const { data: session } = useSession();
  // const createTaskMutation = useCreateTask();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      status: TaskStatus.PENDING,
      assignedToId: 0,
      clientId: 0,
      duration: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = {
      ...data,
      clientId: data.clientId === 0 ? undefined : data.clientId,
      duration: data.duration ? new Date(data.duration) : new Date(),
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
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
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
                  const options = await search(inputValue);
                  const currentUserEmail = session?.user?.email;
                  return options.filter(
                    (option) => option.user.email !== currentUserEmail
                  );
                }}
                onChange={(option) => {
                  field.onChange(option ? option.value : 0);
                  setSelectedUser(option);
                }}
                isClearable
                placeholder='Search user by name or email...'
              />
              <FormMessage />
              {selectedUser && (
                <Card className='mt-4 p-4 break-words whitespace-pre-line w-full'>
                  <div className='font-semibold break-words whitespace-pre-line text-left'>
                    {selectedUser.user.name}
                  </div>
                  <div className='text-xs text-gray-600 break-all text-left'>
                    {selectedUser.user.email}
                  </div>
                </Card>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='clientId'
          render={({ field }) => (
            <FormItem>
              <ReactAsyncSelect<SearchClientOption>
                label='Client'
                name='clientId'
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
                <Card className='mt-4 p-4 break-words whitespace-pre-line w-full'>
                  <div className='font-semibold break-words whitespace-pre-line text-left'>
                    {selectedClient.user.name}
                  </div>
                  <div className='text-xs text-gray-600 break-all text-left'>
                    {selectedClient.user.email}
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
