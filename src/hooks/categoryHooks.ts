import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api';

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['get-categories'],
    queryFn: async () => {
      const { data = [] } = await categoryApi.get();
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-category'],
    mutationFn: async (category: any) => {
      const response = await categoryApi.create(category);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-categories'] }),
  });
};
