import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from 'helpers/api';

export default function useUpdateStep() {
  const queryClient = useQueryClient();

  const query = useMutation({
    mutationFn: async ({ id, appKey, key, connectionId, name, parameters, visualPosition }) => {
      const payload = {
        appKey,
        key,
        connectionId,
        name,
        parameters,
        visualPosition,
      };
      
      console.log(`🔄 Updating step ${id} with:`, payload);
      
      const { data } = await api.patch(`/v1/steps/${id}`, payload);
      
      console.log(`✅ Update step response:`, data);
      
      return data;
    },

    onSuccess: async (data, variables) => {
      // Only invalidate flows if it's not just a position update
      if (!variables.visualPosition || Object.keys(variables).length > 2) {
        await queryClient.invalidateQueries({
          queryKey: ['flows'],
        });
      } else {
        console.log('💾 Position-only update - skipping flow invalidation');
      }
    },
  });

  return query;
}
