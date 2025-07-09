'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Homepage() {
  const { data: session } = useSession();

  redirect(
    `/dashboard/${session?.user.role === 'USER' ? '/my-tasks' : '/tasks'}`
  );
  // return <div>check</div>;
}
