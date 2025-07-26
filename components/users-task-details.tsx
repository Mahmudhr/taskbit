import { UserTaskType } from '@/types/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import UserTaskDetails from './user-task-details';
import UserTaskPaymentDetails from './user-task-payment-details';

export default function UsersTaskDetails({ data }: { data: UserTaskType }) {
  return (
    <div className='space-y-4'>
      <Tabs defaultValue='task_details' className='w-full'>
        <TabsList className='mb-4 w-full'>
          <TabsTrigger className='w-full' value='task_details'>
            Task Details
          </TabsTrigger>
          <TabsTrigger className='w-full' value='payment_details'>
            Payment Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value='task_details'>
          <UserTaskDetails task={data} />
        </TabsContent>
        <TabsContent value='payment_details'>
          <UserTaskPaymentDetails payments={data.payments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
