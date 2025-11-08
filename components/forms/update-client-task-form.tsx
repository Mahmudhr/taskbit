'use client';

import { ClientTaskType, PaperType, TaskStatus } from '@prisma/client';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  allTaskStatus,
  clientAllTaskType,
  clientTaskTypeConverter,
  generateUniqueId,
  getErrorMessage,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { Textarea } from '../ui/textarea';
import { useNewClientTasks } from '@/hooks/use-new-client';
import { toast } from 'sonner';
import { ClientTasksType } from '@/types/common';

const FormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  correction_description: z.string().optional(),
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
  task_type: z.nativeEnum(ClientTaskType),
  assignedUserIds: z.array(z.number()).optional(),
  clientId: z.coerce.number().optional(),
  duration: z.date().optional().nullable(),
  unique_id: z.string().min(2).max(100),
});

export default function UpdateClientTaskForm({
  setIsOpen,
  data,
}: {
  setIsOpen: (open: boolean) => void;
  data?: ClientTasksType | null;
}) {
  const [isPending, startTransition] = useTransition();
  const { updateClientTaskMutationAsync } = useNewClientTasks();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      amount: data?.amount || 0,
      status: data?.status || TaskStatus.PENDING,
      duration: data?.duration || null,
      unique_id: data?.unique_id || '',
      paper_type: data?.paper_type || 'CONFERENCE',
      task_type: data?.task_type || 'REGULAR',
    },
  });
  function onSubmit(formData: z.infer<typeof FormSchema>) {
    const payload = {
      ...formData,
      id: data?.id,
      updatedAt: new Date(),
    };

    startTransition(() => {
      toast.promise(updateClientTaskMutationAsync(payload), {
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
          name='task_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select task type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {clientAllTaskType.map((status) => (
                    <SelectItem key={status} value={status}>
                      {
                        clientTaskTypeConverter[
                          status as keyof typeof clientTaskTypeConverter
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

        {/* Conditional correction description field */}
        {form.watch('task_type') === 'CORRECTION' && (
          <FormField
            control={form.control}
            name='correction_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correction Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Describe what needs to be corrected or revised'
                    className='resize-none'
                    rows={4}
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
