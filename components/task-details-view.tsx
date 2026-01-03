'use client';

import { TaskType } from '@/types/common';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import TaskDetails from './task-details';
import PaymentDetails from './payment-details';
import { useSession } from 'next-auth/react';

export default function TaskDetailsView({ task }: { task: TaskType }) {
  const { data: session } = useSession();

  return (
    <div className='space-y-4'>
      <Tabs defaultValue='task_details' className='w-full'>
        <TabsList className='mb-4 w-full'>
          <TabsTrigger className='w-full' value='task_details'>
            Task Details
          </TabsTrigger>
          {session?.user?.role !== 'CO_ADMIN' && (
            <TabsTrigger className='w-full' value='payment_details'>
              Payment Details
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value='task_details'>
          <TaskDetails task={task} />
        </TabsContent>
        <TabsContent value='payment_details'>
          <PaymentDetails payments={task.payments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
