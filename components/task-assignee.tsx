'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Users } from 'lucide-react';

type TaskAssigneeProps = {
  id: number;
  name: string;
  email: string;
}[];

export default function TaskAssignee({ data }: { data: TaskAssigneeProps }) {
  return data.length > 0 ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Users />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Assignees</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.map((user) => (
          <DropdownMenuItem key={user.id} className='text-sm'>
            {user.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    '-'
  );
  // <div className='bg-yellow-200'>
  //   {data.map((user) => (
  //     <div key={user.id}>
  //       <h3>{user.name}</h3>
  //       <p>{user.email}</p>
  //     </div>
  //   ))}
  // </div>
}
