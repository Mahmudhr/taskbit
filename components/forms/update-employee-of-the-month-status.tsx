'use client';

import { useFetchEmployeeOfTheMonth } from '@/hooks/use-employee-of-the-month';
import { useSession } from 'next-auth/react';

export default function UpdateEmployeeOfTheMonthStatus({
  setIsOpen,
}: {
  setIsOpen?: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const { data, isLoading } = useFetchEmployeeOfTheMonth(
    session?.user?.email ?? ''
  );
  return <div>Update Employee Of The Month Status</div>;
}
