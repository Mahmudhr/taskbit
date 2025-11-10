import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
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
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';
import { getErrorMessage } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { NewClientType } from '@/types/common';
type UpdateNewClientFormProps = {
  setIsOpen: (value: boolean) => void;
  data: NewClientType | null;
};

export const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(5, { message: 'Email must be at least 5 characters long' }),

    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits long' })
      .max(15, { message: 'Phone number cannot be longer than 15 digits' })
      .regex(/^[+]?[0-9]+$/, {
        message: 'Phone number can only contain numbers and optional + prefix',
      }),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine(
    (data) => {
      if (data.password && data.password.trim() !== '') {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters long',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.trim() !== '') {
        return data.confirmPassword && data.confirmPassword.trim() !== '';
      }
      return true;
    },
    {
      message: 'Confirm password is required when password is provided',
      path: ['confirmPassword'],
    }
  )
  .refine(
    (data) => {
      if (
        data.password &&
        data.password.trim() !== '' &&
        data.confirmPassword &&
        data.confirmPassword.trim() !== ''
      ) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

export default function UpdateNewClientForm({
  setIsOpen,
  data,
}: UpdateNewClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      password: '',
      confirmPassword: '',
      phone: data?.phone || '',
      status: data?.status || 'ACTIVE',
    },
  });

  const { updateNewClientAsync } = useUser();

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;
    const payload = {
      id: data.id,
      data: {
        name: formData.name,
        email: formData.email,
        password: formData.password ? formData.password : '',
        phone: formData.phone,
        status: formData.status,
      },
    };

    startTransition(() => {
      toast.promise(updateNewClientAsync(payload), {
        loading: 'Creating New Client...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully updated Client';
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user name'
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex flex-col gap-2'>
                <FormLabel>Password (Optional)</FormLabel>
                <span className='text-xs text-gray-500'>
                  {' '}
                  (leave blank to keep current)
                </span>
              </div>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter new password'
                  type='password'
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional confirm password field */}
        {form.watch('password') && form.watch('password')?.trim() !== '' && (
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    className='w-full'
                    placeholder='Confirm your new password'
                    type='password'
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
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user phone'
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
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select client status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>
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
          Update
        </Button>
      </form>
    </Form>
  );
}
