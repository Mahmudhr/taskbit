'use client';

import {
  CheckSquare,
  CreditCard,
  Users,
  User,
  Banknote,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserNav } from './user.nav';
import { useSession } from 'next-auth/react';

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tasks',
    url: '/dashboard/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Payments',
    url: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    title: 'Salaries',
    url: '/dashboard/salaries',
    icon: Banknote,
  },
  {
    title: 'Expenses',
    url: '/dashboard/expenses',
    icon: Banknote,
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Clients',
    url: '/dashboard/clients',
    icon: Users,
  },
];

const userMenuItems = [
  {
    title: 'My Tasks',
    url: '/dashboard/my-tasks',
    icon: User,
  },
  // {
  //   title: 'My Payments',
  //   url: '/dashboard/my-payments',
  //   icon: CreditCard,
  // },
];

const MenuSkeleton = () => (
  <SidebarGroup>
    <SidebarGroupLabel>
      <Skeleton className='h-4 w-20 bg-gray-300 dark:bg-gray-600' />
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton className=''>
              <Skeleton className='h-4 w-4 bg-gray-300 dark:bg-gray-600' />
              <Skeleton className='h-4 w-16 bg-gray-300 dark:bg-gray-600' />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export function AppSidebar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;
  const pathname = usePathname();

  // Loading skeleton component for menu items

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 px-4 py-2 hover:bg-sidebar-accent rounded-md'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <CheckSquare className='h-4 w-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>TaskManager</span>
            <span className='truncate text-xs text-sidebar-foreground/70'>
              Management System
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {status === 'loading' ? (
          <MenuSkeleton />
        ) : (
          <>
            {userRole === 'ADMIN' && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {(userRole === 'USER' || userRole === 'ADMIN') && (
              <SidebarGroup>
                <SidebarGroupLabel>
                  {userRole === 'ADMIN' ? 'User Panel' : 'My Dashboard'}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {userMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
