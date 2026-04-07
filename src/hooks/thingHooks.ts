import { useQuery } from '@tanstack/react-query';
import thingApi from '../api/thingApi';

export const useGetThings = () => {
  return useQuery({
    queryKey: ['get-car-data'],
    queryFn: async () => {
      const { data = [] } = await thingApi.get();
      return data;
    },
  });
};
