'use client';

import { CheckSquare, CreditCard, Users, User, DollarSign } from 'lucide-react';
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
import { UserNav } from './user.nav';

const adminMenuItems = [
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
  {
    title: 'My Payments',
    url: '/dashboard/my-payments',
    icon: DollarSign,
  },
];

export function AppSidebar() {
  // In a real app, you'd get this from authentication context
  const userRole = 'admin'; // or "user"
  const pathname = usePathname();

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
        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
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

        <SidebarGroup>
          <SidebarGroupLabel>User Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
