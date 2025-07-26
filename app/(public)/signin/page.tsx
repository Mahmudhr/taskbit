'use client';

import type React from 'react';

import { signIn, SignInResponse, useSession } from 'next-auth/react';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2Icon } from 'lucide-react';

const FormSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email must be at least 5 characters long' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const previousURL = searchParams.get('callbackUrl');
  const [showPass, setShowPass] = useState(false);

  const { status } = useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const result: SignInResponse | undefined = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result) {
        if (result.ok && result.status === 200) {
          toast.success('Login successfully');
          router.push(previousURL ?? '/dashboard');
        } else {
          toast.error('Wrong username or password');
        }
      } else {
        toast.error('An error occurred during login');
      }
    });
  }
  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.replace(callbackUrl);
    }
  }, [status, router, searchParams]);

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>Sign In</CardTitle>
          <CardDescription className=''>
            Enter your credentials to access the task management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='enter your email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter your password'
                        type={!showPass ? 'password' : 'text'}
                        {...field}
                      />
                    </FormControl>
                    {!showPass ? (
                      <Eye
                        className='w-5 h-5 absolute right-2 top-8'
                        onClick={() => setShowPass(true)}
                      />
                    ) : (
                      <EyeOff
                        className='w-5 h-5 absolute right-2 top-8'
                        onClick={() => setShowPass(false)}
                      />
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2Icon className='animate-spin' />} Sign in
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
