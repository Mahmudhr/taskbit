'use client';

import { UserType } from '@/types/common';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import UserProfileDetailsView from './user-profile-details-view';
import UserDetailsPaymentView from './user-details-payment-view';

interface UserDetailsViewProps {
  user: UserType;
}

export default function UserDetailsView({ user }: UserDetailsViewProps) {
  return (
    <Tabs defaultValue='user_details'>
      <TabsList className='mb-4 w-full'>
        <TabsTrigger value='user_details' className='w-full'>
          User Details
        </TabsTrigger>
        <TabsTrigger value='user_payments' className='w-full'>
          Payments
        </TabsTrigger>
      </TabsList>
      <TabsContent value='user_details' className='w-full'>
        <UserProfileDetailsView user={user} />
      </TabsContent>
      <TabsContent value='user_payments' className='w-full'>
        <UserDetailsPaymentView salaries={user.salaries} />
      </TabsContent>
    </Tabs>
  );
}
