'use client';

import {
  createPayment,
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
    mutationFn: ({
      paymentType,
      referenceNumber,
      amount,
      status,
      userId,
      taskId,
    }: CreatePayment) =>
      createPayment({
        paymentType,
        referenceNumber,
        amount,
        status,
        userId,
        taskId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['payments-calculation'] });
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
  };
}
