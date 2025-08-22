'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  EllipsisVertical,
  ListFilter,
  Calendar,
  DollarSign,
  User,
  Clock,
  FileText,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AlertModal from '@/components/alert-modal';
import CreateTaskForm from '@/components/forms/create-task-form';
import {
  cn,
  generateQueryString,
  getErrorMessage,
  paperTypeConvert,
  taskStatusConvert,
} from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTask } from '@/hooks/use-task';
import { useDebouncedCallback } from 'use-debounce';
import UpdateTaskForm from '@/components/forms/update-task-from';
import { TaskType } from '@/types/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmModal from '@/components/confirm-modal';
import { toast } from 'sonner';
import CreatePaymentForm from '@/components/forms/create-payment-form';
import dayjs from 'dayjs';
import Link from 'next/link';
import Modal from '@/components/modal';
import TaskDetailsView from '@/components/task-details-view';
import TaskFilter from '@/components/filters/task-filter';
import { Skeleton } from '@/components/ui/skeleton';
import TaskAssignee from '@/components/task-assignee';

const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Pending', value: 'PENDING' },
];

export const getStatusBadge = (status: string) => {
  const variants = {
    PENDING:
      'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    IN_PROGRESS:
      'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
    SUBMITTED:
      'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50',
    COMPLETED:
      'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50',
  } as const;
  return (
    <Badge className={cn(variants[status as keyof typeof variants], 'text-xs')}>
      {taskStatusConvert[status as keyof typeof taskStatusConvert]}
    </Badge>
  );
};

export const getPaymentStatusBadge = (amount: number) => {
  if (amount > 0) {
    return (
      <Badge variant='destructive' className='text-xs'>
        <AlertCircle className='w-3 h-3 mr-1' />
        Due
      </Badge>
    );
  } else {
    return (
      <Badge className='bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 text-xs'>
        <CheckCircle className='w-3 h-3 mr-1' />
        Paid
      </Badge>
    );
  }
};

// ✅ Mobile TaskCard Component
const TaskCard = ({
  task,
  index,
  onEdit,
  onView,
  onDelete,
  onPayment,
}: {
  task: TaskType;
  index: number;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onPayment: () => void;
}) => {
  const dueAmount = task.paid ? task.amount - task.paid : task.amount;

  return (
    <Card className='hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400 h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex gap-3 flex-1 items-start'>
            <div className='bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold'>
              #{index + 1}
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className='font-semibold text-lg mb-1 dark:text-gray-100  break-all'
                title={task.title}
              >
                {task.title}
              </p>
              <div className='flex items-center gap-2 flex-wrap'>
                {getStatusBadge(task.status)}
                <Badge
                  variant='outline'
                  className='text-xs dark:border-gray-600 dark:text-gray-300'
                >
                  {
                    paperTypeConvert[
                      task.paper_type as keyof typeof paperTypeConvert
                    ]
                  }
                </Badge>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 dark:hover:bg-gray-700'
                >
                  <EllipsisVertical className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 dark:bg-gray-800 dark:border-gray-700'
              >
                <DropdownMenuLabel className='dark:text-gray-200'>
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator className='dark:border-gray-700' />
                <DropdownMenuItem
                  onClick={onView}
                  className='cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200'
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onEdit}
                  className='cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onPayment}
                  disabled={task.amount === 0}
                  className='cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200'
                >
                  <CreditCard className='mr-2 h-4 w-4' />
                  Make Payment
                </DropdownMenuItem>
                <DropdownMenuSeparator className='dark:border-gray-700' />
                <DropdownMenuItem
                  onClick={onDelete}
                  className='cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4 flex-1'>
        {/* Client and Assignee Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg'>
              <User className='w-4 h-4 text-purple-600 dark:text-purple-400' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs text-muted-foreground dark:text-gray-400'>
                Client
              </p>
              <p className='font-medium text-sm truncate dark:text-gray-200'>
                {task.client?.name || 'No Client'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='bg-green-50 dark:bg-green-900/30 p-2 rounded-lg'>
              <Users className='w-4 h-4 text-green-600 dark:text-green-400' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs text-muted-foreground dark:text-gray-400'>
                Assigned To
              </p>
              <div className='mt-1'>
                <TaskAssignee data={task.assignedUsers} />
              </div>
            </div>
          </div>
        </div>

        {/* Dates Section */}
        <div className='grid grid-cols-1 gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg'>
              <Calendar className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-muted-foreground dark:text-gray-400'>
                Start Date
              </p>
              <p className='font-medium text-sm dark:text-gray-200'>
                {task.startDate
                  ? dayjs(task.startDate).format('DD MMM YYYY')
                  : 'Not Set'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg'>
              <Clock className='w-4 h-4 text-orange-600 dark:text-orange-400' />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-muted-foreground dark:text-gray-400'>
                Due Date
              </p>
              <p className='font-medium text-sm dark:text-gray-200'>
                {task.duration
                  ? dayjs(task.duration).format('DD MMM YYYY')
                  : 'Not Set'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg'>
              <Calendar className='w-4 h-4 text-gray-600 dark:text-gray-400' />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-muted-foreground dark:text-gray-400'>
                Created
              </p>
              <p className='font-medium text-sm dark:text-gray-200'>
                {dayjs(task.createdAt).format('DD MMM YYYY')}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='bg-pink-50 dark:bg-pink-900/30 p-2 rounded-lg'>
              <Calendar className='w-4 h-4 text-pink-600 dark:text-pink-400' />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-muted-foreground dark:text-gray-400'>
                Target Date
              </p>
              <p className='font-medium text-sm dark:text-gray-200'>
                {task.target_date
                  ? dayjs(task.target_date).format('DD MMM YYYY')
                  : 'Not Set'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <DollarSign className='w-4 h-4 text-green-600 dark:text-green-400' />
              <span className='font-medium text-sm dark:text-gray-200'>
                Payment Status
              </span>
            </div>
            {getPaymentStatusBadge(dueAmount)}
          </div>

          <div className='grid grid-cols-3 gap-2 text-sm'>
            <div className='text-center'>
              <p className='text-muted-foreground dark:text-gray-400 text-xs'>
                Total
              </p>
              <p className='font-bold text-base dark:text-gray-200'>
                ৳{task.amount}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground dark:text-gray-400 text-xs'>
                Paid
              </p>
              <p className='font-bold text-base text-green-600 dark:text-green-400'>
                ৳{task.paid || 0}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground dark:text-gray-400 text-xs'>
                Due
              </p>
              <p
                className={`font-bold text-base ${
                  dueAmount > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                ৳{dueAmount}
              </p>
            </div>
          </div>
        </div>

        {/* Links and Description */}
        <div className='space-y-3'>
          {task.link && (
            <div className='flex items-center gap-2'>
              <ExternalLink className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <Link
                href={task.link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium truncate'
              >
                View Task Link
              </Link>
            </div>
          )}

          {task.description && (
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <FileText className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                <span className='text-xs text-muted-foreground dark:text-gray-400'>
                  Description
                </span>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-3 pl-6'>
                {task.description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ Desktop TaskRow Component
const TaskRow = ({
  task,
  index,
  onEdit,
  onView,
  onDelete,
  onPayment,
}: {
  task: TaskType;
  index: number;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onPayment: () => void;
}) => {
  const dueAmount = task.paid ? task.amount - task.paid : task.amount;

  return (
    <Card className='border rounded-lg hover:shadow-md transition-all duration-200 p-4'>
      {/* Top Row - Title and Actions */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-start gap-3 flex-1'>
          <div className='bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold'>
            #{index + 1}
          </div>
          <div className='flex-1 min-w-0'>
            <h3
              className='font-semibold text-lg truncate mb-1 dark:text-gray-100 text-wrap break-all'
              title={task.title}
            >
              {task.title}
            </h3>
            <div className='flex items-center gap-2'>
              {getStatusBadge(task.status)}
              <Badge
                variant='outline'
                className='text-xs dark:border-gray-600 dark:text-gray-300'
              >
                {
                  paperTypeConvert[
                    task.paper_type as keyof typeof paperTypeConvert
                  ]
                }
              </Badge>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 dark:hover:bg-gray-700'
              >
                <EllipsisVertical className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 dark:bg-gray-800 dark:border-gray-700'
            >
              <DropdownMenuLabel className='dark:text-gray-200'>
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='dark:border-gray-700' />
              <DropdownMenuItem
                onClick={onView}
                className='cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200'
              >
                <Eye className='mr-2 h-4 w-4' />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEdit}
                className='cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200'
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onPayment}
                disabled={task.amount === 0}
                className='cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200'
              >
                <CreditCard className='mr-2 h-4 w-4' />
                Make Payment
              </DropdownMenuItem>
              <DropdownMenuSeparator className='dark:border-gray-700' />
              <DropdownMenuItem
                onClick={onDelete}
                className='cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Middle Row - Main Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-3'>
        {/* Client */}
        <div className='flex items-center gap-3'>
          <div className='bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg'>
            <User className='w-4 h-4 text-purple-600 dark:text-purple-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-xs text-muted-foreground dark:text-gray-400'>
              Client
            </p>
            <p className='font-medium text-sm truncate dark:text-gray-200'>
              {task.client?.name || 'No Client'}
            </p>
          </div>
        </div>

        {/* Assigned Users */}
        <div className='flex items-center gap-3'>
          <div className='bg-green-50 dark:bg-green-900/30 p-2 rounded-lg'>
            <Users className='w-4 h-4 text-green-600 dark:text-green-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-xs text-muted-foreground dark:text-gray-400'>
              Assigned To
            </p>
            <div className='mt-1'>
              <TaskAssignee data={task.assignedUsers} />
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className='flex items-center gap-3'>
          <div className='bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg'>
            <Calendar className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <p className='text-xs text-muted-foreground dark:text-gray-400'>
              Assigned Date
            </p>
            <p className='font-medium text-sm dark:text-gray-200'>
              {task.startDate
                ? dayjs(task.startDate).format('DD MMM YYYY')
                : 'Not Set'}
            </p>
          </div>
        </div>

        {/* Due Date */}
        <div className='flex items-center gap-3'>
          <div className='bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg'>
            <Clock className='w-4 h-4 text-orange-600 dark:text-orange-400' />
          </div>
          <div>
            <p className='text-xs text-muted-foreground dark:text-gray-400'>
              Delivery Date
            </p>
            <p className='font-medium text-sm dark:text-gray-200'>
              {task.duration
                ? dayjs(task.duration).format('DD MMM YYYY')
                : 'Not Set'}
            </p>
          </div>
        </div>

        {/* Created At */}
        {/* <div className='flex items-center gap-3'>
          <div className='bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg'>
            <Calendar className='w-4 h-4 text-gray-600 dark:text-gray-400' />
          </div>
          <div>
            <p className='text-xs text-muted-foreground dark:text-gray-400'>
              Created
            </p>
            <p className='font-medium text-sm dark:text-gray-200'>
              {dayjs(task.createdAt).format('DD MMM YYYY')}
            </p>
          </div>
        </div> */}
      </div>

      {/* Bottom Row - Payment Information */}
      <CardContent className='rounded-lg p-3'>
        <div className='flex items-center justify-between'>
          {/* Payment Details */}
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <DollarSign className='w-4 h-4 text-green-600 dark:text-green-400' />
              <span className='font-medium text-sm dark:text-gray-200'>
                Payment:
              </span>
            </div>

            <div className='flex items-center gap-4 text-sm'>
              <div className='text-center'>
                <p className='text-muted-foreground dark:text-gray-400 text-xs'>
                  Total
                </p>
                <p className='font-bold dark:text-gray-200'>৳{task.amount}</p>
              </div>
              <div className='text-center'>
                <p className='text-muted-foreground dark:text-gray-400 text-xs'>
                  Paid
                </p>
                <p className='font-bold text-green-600 dark:text-green-400'>
                  ৳{task.paid || 0}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-muted-foreground dark:text-gray-400 text-xs'>
                  Due
                </p>
                <p
                  className={`font-bold ${
                    dueAmount > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  ৳{dueAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status & Links */}
          <div className='flex items-center gap-3'>
            {getPaymentStatusBadge(dueAmount)}

            {task.link && (
              <Link
                href={task.link}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium'
              >
                <ExternalLink className='w-3 h-3' />
                Link
              </Link>
            )}

            <div className='text-xs text-muted-foreground dark:text-gray-400'>
              Created: {dayjs(task.createdAt).format('DD MMM')}
            </div>
          </div>
        </div>

        {/* Description Row (if exists) */}
        {task.description && (
          <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
            <div className='flex items-start gap-2'>
              <FileText className='w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-2'>
                {task.description}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ✅ Mobile Card Skeleton
const TaskCardSkeleton = () => (
  <Card className='h-96 border-l-4 border-l-gray-200 dark:border-l-gray-600 dark:bg-gray-800/50'>
    <CardHeader>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3 flex-1'>
          <Skeleton className='w-10 h-10 rounded-full dark:bg-gray-700' />
          <div className='flex-1'>
            <Skeleton className='h-5 w-3/4 mb-2 dark:bg-gray-700' />
            <div className='flex gap-2'>
              <Skeleton className='h-4 w-16 dark:bg-gray-700' />
              <Skeleton className='h-4 w-20 dark:bg-gray-700' />
            </div>
          </div>
        </div>
        <Skeleton className='w-8 h-8 dark:bg-gray-700' />
      </div>
    </CardHeader>
    <CardContent className='space-y-4'>
      <div className='space-y-3'>
        {[...Array(2)].map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <Skeleton className='w-8 h-8 rounded-lg dark:bg-gray-700' />
            <div className='flex-1'>
              <Skeleton className='h-3 w-12 mb-1 dark:bg-gray-700' />
              <Skeleton className='h-4 w-24 dark:bg-gray-700' />
            </div>
          </div>
        ))}
      </div>
      <div className='space-y-3'>
        {[...Array(1)].map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <Skeleton className='w-8 h-8 rounded-lg dark:bg-gray-700' />
            <div className='flex-1'>
              <Skeleton className='h-3 w-16 mb-1 dark:bg-gray-700' />
              <Skeleton className='h-4 w-20 dark:bg-gray-700' />
            </div>
          </div>
        ))}
      </div>
      <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
        <Skeleton className='h-16 w-full dark:bg-gray-700' />
      </div>
    </CardContent>
  </Card>
);

// ✅ Desktop Row Skeleton
const TaskRowSkeleton = () => (
  <div className='bg-white dark:bg-gray-800/50 border dark:border-gray-700 rounded-lg p-4 mb-3'>
    <div className='flex items-start justify-between mb-3'>
      <div className='flex items-center gap-3 flex-1'>
        <Skeleton className='w-8 h-8 rounded-full dark:bg-gray-700' />
        <div>
          <Skeleton className='h-5 w-48 mb-2 dark:bg-gray-700' />
          <div className='flex gap-2'>
            <Skeleton className='h-4 w-16 dark:bg-gray-700' />
            <Skeleton className='h-4 w-20 dark:bg-gray-700' />
          </div>
        </div>
      </div>
      <Skeleton className='w-8 h-8 dark:bg-gray-700' />
    </div>

    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          <Skeleton className='w-8 h-8 rounded-lg dark:bg-gray-700' />
          <div>
            <Skeleton className='h-3 w-12 mb-1 dark:bg-gray-700' />
            <Skeleton className='h-4 w-20 dark:bg-gray-700' />
          </div>
        </div>
      ))}
    </div>

    <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3'>
      <Skeleton className='h-16 w-full dark:bg-gray-700' />
    </div>
  </div>
);

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [taskOpen, setTaskOpen] = useState(false);
  const [updateTaskOpen, setUpdateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [taskId, setTaskId] = useState<number | null>(null);
  const [openPayment, setOpenPayment] = useState(false);
  const [viewTask, setViewTask] = useState<TaskType | null>(null);
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [openSalaryFilter, setOpenSalaryFilter] = useState(false);

  const router = useRouter();
  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || 'PENDING',
    paper_type: searchParams.get('paper_type') || '',
    client: searchParams.get('client') || '',
    payment_status: searchParams.get('payment_status') || '',
    due_date: searchParams.get('due_date') || '',
    due_month: searchParams.get('due_month') || '',
    due_year: searchParams.get('due_year') || '',
    task_create: searchParams.get('task_create') || '',
    task_create_year: searchParams.get('task_create_year') || '',
    task_create_month: searchParams.get('task_create_month') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const {
    fetchTasks,
    fetchTasksMutation,
    deleteTaskAsync,
    fetchTasksCalculationMutation,
  } = useTask(queryString);

  const handleDeleTask = () => {
    if (taskId === null) return;
    startTransition(() => {
      toast.promise(deleteTaskAsync(taskId), {
        loading: 'Deleting task...',
        success: () => {
          setConfirmModal(false);
          return 'Successfully Task Deleted';
        },
        error: (err) => getErrorMessage(err) || 'Something went wrong!',
      });
    });
  };

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task);
    setUpdateTaskOpen(true);
  };

  const handleViewTask = (task: TaskType) => {
    setViewTask(task);
    setViewTaskModal(true);
  };

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold dark:text-gray-100'>
          All Tasks
        </h1>
        <Button onClick={() => setTaskOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Task
        </Button>
      </div>

      {/* Statistics Cards */}
      <div>
        {!fetchTasksCalculationMutation.isLoading ? (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card
              className='cursor-pointer'
              onClick={() => {
                setParams((prev) => ({
                  ...prev,
                  status: '',
                }));
              }}
            >
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold dark:text-gray-100'>
                  {fetchTasksCalculationMutation?.data?.totalTasks || 0}
                </div>
                <div className='text-xs text-muted-foreground dark:text-gray-400'>
                  Total Entries
                </div>
              </CardContent>
            </Card>
            <Card
              className='cursor-pointer'
              onClick={() => {
                setParams((prev) => ({
                  ...prev,
                  status: 'COMPLETED',
                }));
              }}
            >
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {fetchTasksCalculationMutation?.data?.completedCount}
                </div>
                <div className='text-xs text-muted-foreground dark:text-gray-400'>
                  Completed
                </div>
              </CardContent>
            </Card>
            <Card
              className='cursor-pointer'
              onClick={() => {
                setParams((prev) => ({
                  ...prev,
                  status: 'IN_PROGRESS',
                }));
              }}
            >
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                  {fetchTasksCalculationMutation?.data?.inProgressCount}
                </div>
                <div className='text-xs text-muted-foreground dark:text-gray-400'>
                  In Progress
                </div>
              </CardContent>
            </Card>
            <Card
              className='cursor-pointer'
              onClick={() => {
                setParams((prev) => ({
                  ...prev,
                  status: 'PENDING',
                }));
              }}
            >
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {fetchTasksCalculationMutation?.data?.pendingCount}
                </div>
                <div className='text-xs text-muted-foreground dark:text-gray-400'>
                  Pending
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {fetchTasksCalculationMutation?.data?.submittedCount}
                </div>
                <div className='text-xs text-muted-foreground dark:text-gray-400'>
                  Submitted
                </div>
              </CardContent>
            </Card> */}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className='dark:bg-gray-800/50 dark:border-gray-700'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Skeleton className='h-4 w-24 mb-2 dark:bg-gray-700' />
                      <Skeleton className='h-8 w-16 dark:bg-gray-700' />
                    </div>
                    <Skeleton className='h-8 w-8 dark:bg-gray-700' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='dark:text-gray-100'>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400' />
              <Input
                placeholder='Search tasks...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8 '
              />
            </div>
            <Button
              onClick={() => setOpenSalaryFilter(true)}
              className='w-full sm:w-auto'
            >
              <ListFilter className='mr-2 h-4 w-4' />
              Filter
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {params.search && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                {params.search}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      search: '',
                    }));
                    setSearchQuery('');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.client && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Client: {params.client}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      client: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.status && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Status:{' '}
                {params.status !== 'ALL'
                  ? taskStatusConvert[
                      params.status as keyof typeof taskStatusConvert
                    ]
                  : params.status}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      status: '',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.paper_type && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Paper Type:{' '}
                {
                  paperTypeConvert[
                    params.paper_type as keyof typeof paperTypeConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      paper_type: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}

            {params.due_date && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Due Date: {dayjs(params.due_date).format('DD-MM-YYYY')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_date: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.due_month && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Due Month:{' '}
                {dayjs()
                  .month(parseInt(params.due_month) - 1)
                  .format('MMMM')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_month: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.due_year && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Due Year: {params.due_year}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      due_year: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.task_create && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Task Create: {dayjs(params.task_create).format('DD-MM-YYYY')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_create: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.task_create_month && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Create Month:{' '}
                {dayjs()
                  .month(parseInt(params.task_create_month) - 1)
                  .format('MMMM')}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_create_month: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.task_create_year && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm dark:text-gray-200'>
                Create Year: {params.task_create_year}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      task_create_year: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.payment_status && (
              <div className='pl-3 pr-2 py-1 border dark:border-gray-600 dark:bg-gray-700/50 flex gap-2 items-center rounded-full text-sm capitalize dark:text-gray-200'>
                Payment Status: {params.payment_status}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      payment_status: '',
                      page: '1',
                    }));
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className='flex gap-2 my-4'>
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            size={'sm'}
            variant={params.status === tab.value ? 'default' : 'outline'}
            onClick={() =>
              setParams((prev) => ({
                ...prev,
                status: tab.value,
                page: '1',
              }))
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <Card className='dark:bg-[#232325] dark:border-gray-700'>
        <CardHeader>
          <CardTitle className='dark:text-gray-100'>Tasks List</CardTitle>
        </CardHeader>
        <CardContent className='md:p-6 pt-0 p-3'>
          {!fetchTasksMutation.isLoading ? (
            <>
              {/* ✅ Mobile View: Cards */}
              <div className='flex flex-col md:hidden gap-5'>
                {fetchTasks &&
                  fetchTasks.data.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={() => handleEditTask(task)}
                      onView={() => handleViewTask(task)}
                      onDelete={() => {
                        setTaskId(task.id);
                        setConfirmModal(true);
                      }}
                      onPayment={() => {
                        setOpenPayment(true);
                        setTaskId(task.id);
                      }}
                    />
                  ))}
              </div>

              {/* ✅ Desktop View: Rows */}
              <div className='hidden md:block'>
                <div className='flex flex-col gap-5'>
                  {fetchTasks &&
                    fetchTasks.data.map((task, index) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={() => handleEditTask(task)}
                        onView={() => handleViewTask(task)}
                        onDelete={() => {
                          setTaskId(task.id);
                          setConfirmModal(true);
                        }}
                        onPayment={() => {
                          setOpenPayment(true);
                          setTaskId(task.id);
                        }}
                      />
                    ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ✅ Mobile Loading: Card Skeletons */}
              <div className='grid grid-cols-1 md:hidden gap-6'>
                {[...Array(4)].map((_, i) => (
                  <TaskCardSkeleton key={i} />
                ))}
              </div>

              {/* ✅ Desktop Loading: Row Skeletons */}
              <div className='hidden md:block space-y-0'>
                {[...Array(6)].map((_, i) => (
                  <TaskRowSkeleton key={i} />
                ))}
              </div>
            </>
          )}

          {fetchTasks && fetchTasks?.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4 mt-6'>
              <div className='text-sm text-muted-foreground dark:text-gray-400'>
                Showing 1 to {fetchTasks?.data.length} of{' '}
                {fetchTasks?.meta.count} results
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (+params.page - 1).toString(),
                    }))
                  }
                  disabled={+params.page === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (+params.page + 1).toString(),
                    }))
                  }
                  disabled={
                    +params.page === (fetchTasks && fetchTasks.meta.totalPages)
                  }
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AlertModal
        isOpen={taskOpen}
        setIsOpen={setTaskOpen}
        title='Create new task'
        description=' '
      >
        <CreateTaskForm setIsOpen={setTaskOpen} />
      </AlertModal>
      <AlertModal
        isOpen={updateTaskOpen}
        setIsOpen={setUpdateTaskOpen}
        title='Update Task'
        description=' '
      >
        <UpdateTaskForm setIsOpen={setUpdateTaskOpen} data={selectedTask} />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your task '
        onClick={handleDeleTask}
      />
      <AlertModal
        isOpen={openPayment}
        setIsOpen={setOpenPayment}
        title='Create new payment'
        description=' '
      >
        <CreatePaymentForm setIsOpen={setOpenPayment} taskId={taskId} />
      </AlertModal>
      <Modal
        isOpen={viewTaskModal}
        setIsOpen={setViewTaskModal}
        title='Task Details'
        description=' '
      >
        {viewTask && <TaskDetailsView task={viewTask} />}
      </Modal>
      <Modal
        isOpen={openSalaryFilter}
        setIsOpen={setOpenSalaryFilter}
        title='Filter Salary'
        description=' '
      >
        <TaskFilter
          setParams={setParams}
          params={params}
          setOpenTaskFilter={setOpenSalaryFilter}
        />
      </Modal>
    </div>
  );
}
