import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export function useRoom(roomId: string | null) {
  const query = useQuery({
    queryKey: ['room_members', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data } = await api.get(`/rooms/${roomId}/members`);
      return data.members || [];
    },
    enabled: !!roomId,
    staleTime: 60000,
  });

  return {
    members: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
