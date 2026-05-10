import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billApi } from '../api';
import { useTransferStaleStore } from '../state/useTransferStale';

export const useGetBills = (month: string) => {
  return useQuery({
    queryKey: ['get-bills', month],
    queryFn: async () => {
      const { data = [] } = await billApi.get({ month });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  const { markTransferStale } = useTransferStaleStore();
  return useMutation({
    mutationKey: ['create-bill'],
    mutationFn: async (bill: any) => {
      const response = await billApi.create(bill);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-bills'] });
      markTransferStale();
    },
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();
  const { markTransferStale } = useTransferStaleStore();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const { billId, ...rest } = data;
      const response = await billApi.payBill(billId, rest);
      return response.data;
    },
    onSuccess: (newTxn, vars) => {
      queryClient.setQueryData(
        ['get-bills', vars.month],
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.map((bill) => {
            return bill.id === vars.billId
              ? { ...bill, transactions: [...bill.transactions, newTxn] }
              : bill;
          });
        },
      );
      markTransferStale();
    },
  });
};
