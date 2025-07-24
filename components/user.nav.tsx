'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { roleConvert } from '@/lib/utils';
import { User, LogOut, ChevronsUpDown } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function UserNav() {
  const { data: session } = useSession();

  const initials =
    session?.user.name &&
    session?.user.name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='relative h-10 w-full justify-start rounded-md px-2 text-sm font-normal bg-transparent'
        >
          <Avatar className='h-6 w-6 mr-2'>
            <AvatarFallback className='text-xs bg-gray-200 dark:text-gray-700'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col items-start flex-1 min-w-0'>
            <span className='truncate text-xs font-medium'>
              {session?.user.name}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {roleConvert[session?.user.role as keyof typeof roleConvert]}
            </span>
          </div>
          <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {session?.user.name}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {session?.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/profile' className='cursor-pointer'>
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className='cursor-pointer text-red-600 focus:text-red-600'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
