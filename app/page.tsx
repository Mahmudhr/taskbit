'use client';

import Loading from '@/components/loading';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Homepage() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <Loading />;
  redirect(
    `/dashboard/${session?.user.role === 'USER' ? '/my-tasks' : '/tasks'}`
  );
}
