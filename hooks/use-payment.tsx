'use client';

import { createPayment, fetchAllPayments } from '@/server/payment/payment';
import { CreatePayment } from '@/server/types/payment-type';
import { Meta, PaymentTypes, Response } from '@/types/common';
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

  return {
    createPaymentMutation,
    createPaymentMutationAsync: createPaymentMutation.mutateAsync,
    fetchPaymentsMutation,
    fetchPayments: fetchPaymentsMutation.data,
  };
}
