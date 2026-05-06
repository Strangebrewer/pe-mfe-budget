import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '../api';

export const useGetAccounts = () => {
  return useQuery({
    queryKey: ['get-accounts'],
    queryFn: async () => {
      const { data = [] } = await accountApi.get();
      return data;
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-account'],
    mutationFn: async (account: any) => {
      const response = await accountApi.create(account);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-accounts'] }),
  });
};
