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
import { toast } from 'sonner';
import { useTransition } from 'react';
import { getErrorMessage, userStatusConvert } from '@/lib/utils';
import { useClient } from '@/hooks/use-client';
import { Loader2Icon } from 'lucide-react';
import { ClientType } from '@/types/common';
import { ClientStatus } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type UpdateClientFormProps = {
  data: ClientType | null;
  setIsOpen: (open: boolean) => void;
};

export const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Clients name must be at least 2 characters.',
  }),
  email: z
    .string()
    .optional()
    .refine((email) => !email || z.string().email().safeParse(email).success, {
      message: 'Please enter a valid email address',
    }),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(ClientStatus),
});

export default function UpdateClientForm({
  data,
  setIsOpen,
}: UpdateClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const { updateClientAsync } = useClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      company: data?.company || '',
      phone: data?.phone || '',
      status: data?.status || ClientStatus.ACTIVE,
    },
  });

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;
    const payload = {
      id: data.id,
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        status: formData.status,
      },
    };
    startTransition(() => {
      toast.promise(updateClientAsync(payload), {
        loading: 'Updating client...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully updated client';
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter client name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter client email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='company'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (optional)</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter company name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter phone number'
                  type='phone'
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
                  {Object.values(ClientStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {
                        userStatusConvert[
                          status as keyof typeof userStatusConvert
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
        <Button
          type='submit'
          disabled={isPending || !form.formState.isDirty}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Update
        </Button>
      </form>
    </Form>
  );
}
