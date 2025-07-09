'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session } = useSession();

  redirect(
    `/dashboard/${session?.user.role === 'USER' ? '/my-tasks' : '/tasks'}`
  );
}
