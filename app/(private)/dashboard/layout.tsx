'use client';

import type React from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import HeaderGiftBox from '@/components/header-gift-box';
import { signOut, useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id as string) : 0;

  const { userProfile } = useUserProfile(userId);

  useEffect(() => {
    if (userProfile?.isDeleted === true || userProfile?.status === 'INACTIVE') {
      signOut();
    }
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <h1 className='text-lg font-semibold'>Taskbit</h1>
          <div className='ml-auto'>
            <div className='flex items-center gap-2'>
              <HeaderGiftBox />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 md:p-4 p-3 bg-sidebar'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
