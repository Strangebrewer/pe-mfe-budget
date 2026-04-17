import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../api';
import { useTransferStaleStore } from '../state/useTransferStale';

export const useGetTransactions = (query?: Record<string, any>) => {
  return useQuery({
    queryKey: ['get-transactions', query],
    queryFn: async () => {
      const { data = [] } = await transactionApi.get(query);
      return data;
    },
    enabled: query && 'category' in query ? !!query.category : true,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { markTransferStale } = useTransferStaleStore();
  return useMutation({
    mutationKey: ['create-transaction'],
    mutationFn: async (transaction: any) => {
      const response = await transactionApi.create(transaction);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-transactions'] });
      markTransferStale();
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { markTransferStale } = useTransferStaleStore();
  return useMutation({
    mutationKey: ['update-transaction'],
    mutationFn: async (transaction: any) => {
      const response = await transactionApi.update(transaction);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['get-bills'] });
      markTransferStale();
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { markTransferStale } = useTransferStaleStore();
  return useMutation({
    mutationKey: ['delete-transaction'],
    mutationFn: async (id: string) => {
      const response = await transactionApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['get-bills'] });
      markTransferStale();
    },
  });
};
