'use client';

import {
  createPayment,
  createReceivableAmount,
  deletePayment,
  fetchAllPayments,
  fetchAllPaymentsCalculation,
  updatePaymentByUser,
} from '@/server/payment/payment';
import { CreatePayment } from '@/server/types/payment-type';
import { $Enums } from '@prisma/client';
import {
  Meta,
  PaymentCalculationsType,
  PaymentTypes,
  Response,
} from '@/types/common';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function usePayment(options?: string) {
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: async ({
      paymentType,
      referenceNumber,
      amount,
      status,
      userId,
      taskId,
    }: CreatePayment) => {
      const result = await createPayment({
        paymentType,
        referenceNumber,
        amount,
        status,
        userId,
        taskId,
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['payments-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-calc'] });
    },
  });

  const fetchPaymentsMutation = useQuery<Response<PaymentTypes[], Meta>>({
    queryKey: ['payments', options],
    queryFn: async () => {
      const res = await fetchAllPayments(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const fetchPaymentsCalculationMutation = useQuery<PaymentCalculationsType>({
    queryKey: ['payments-calculation', options],
    queryFn: async () => {
      const res = await fetchAllPaymentsCalculation(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({
      paymentId,
      status,
      paymentType,
      referenceNumber,
    }: {
      paymentId: number;
      status: $Enums.PaymentStatus;
      paymentType: $Enums.PaymentType;
      referenceNumber: string;
    }) =>
      updatePaymentByUser({ paymentId, status, paymentType, referenceNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['payments-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-calc'] });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: number) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-calc'] });
      queryClient.invalidateQueries({ queryKey: ['payments-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createReceivablePaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; taskId: number }) => {
      const result = await createReceivableAmount(data);
      if (!result.success) {
        throw new Error(
          result.message || 'Failed to create receivable payment'
        );
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-calc'] });
      queryClient.invalidateQueries({ queryKey: ['payments-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    createPaymentMutation,
    createPaymentMutationAsync: createPaymentMutation.mutateAsync,
    fetchPaymentsMutation,
    fetchPayments: fetchPaymentsMutation.data,
    fetchPaymentsCalculationMutation,
    fetchPaymentsCalculation: fetchPaymentsCalculationMutation.data,
    updatePaymentMutation,
    updatePaymentMutationAsync: updatePaymentMutation.mutateAsync,

    deletePayment: deletePaymentMutation.mutate,
    deletePaymentAsync: deletePaymentMutation.mutateAsync,
    deletePaymentMutation,
    createReceivablePaymentMutation,
    createReceivablePaymentMutationAsync:
      createReceivablePaymentMutation.mutateAsync,
  };
}
