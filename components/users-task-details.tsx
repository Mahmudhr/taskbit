import { UserTaskType } from '@/types/common';
import UserTaskDetails from './user-task-details';

export default function UsersTaskDetails({ data }: { data: UserTaskType }) {
  return (
    <div className='space-y-4'>
      <UserTaskDetails task={data} />
    </div>
  );
}
