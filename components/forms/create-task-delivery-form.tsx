'use client';

import { UserTaskType } from '@/types/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskStatus } from '@prisma/client';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getErrorMessage, taskStatusConvert } from '@/lib/utils';
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { useTransition } from 'react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useUserTask } from '@/hooks/use-user-task';

export type CreateTaskDeliveryFormProps = {
  setIsOpen: (isOpen: boolean) => void;
  data?: UserTaskType | null;
};

const FormSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: 'Title must be at least 2 characters.' }),
    note: z.string().optional(),
    link: z.string().optional(),
    status: z.nativeEnum(TaskStatus),
  })
  .refine(
    (data) => {
      if (data.status === TaskStatus.SUBMITTED) {
        return (
          data.link &&
          data.link.trim().length > 0 &&
          z.string().url().safeParse(data.link).success
        );
      }

      if (data.link && data.link.trim().length > 0) {
        return z.string().url().safeParse(data.link).success;
      }
      return true;
    },
    {
      message:
        "Link is required and must be a valid URL when status is 'Submitted'",
      path: ['link'],
    }
  );

export default function CreateTaskDeliveryForm({
  setIsOpen,
  data,
}: CreateTaskDeliveryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { updateUserTaskDeliveryMutationAsync } = useUserTask();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: data?.title || '',
      link: data?.link || '',
      status: data?.status || TaskStatus.PENDING,
      note: data?.note || '',
    },
  });

  const watchedStatus = form.watch('status');

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;

    const payload = {
      id: data.id,
      data: {
        ...formData,
      },
    };

    startTransition(() => {
      toast.promise(updateUserTaskDeliveryMutationAsync(payload), {
        loading: 'Updating task...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Task Delivered';
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
                  disabled={true}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='link'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Link{' '}
                {watchedStatus === TaskStatus.SUBMITTED && (
                  <span className='text-red-500'>*</span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder={
                    watchedStatus === TaskStatus.SUBMITTED
                      ? 'Enter task delivery link (required)'
                      : 'Enter task delivery link (optional)'
                  }
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
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Trigger validation for the link field when status changes
                  form.trigger('link');
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {Object.values(TaskStatus).map(
                    (status) =>
                      status !== 'COMPLETED' && (
                        <SelectItem key={status} value={status}>
                          {
                            taskStatusConvert[
                              status as keyof typeof taskStatusConvert
                            ]
                          }
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Leave a note (optional)'
                  className='resize-none'
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
          Update Task
        </Button>
      </form>
    </Form>
  );
}
