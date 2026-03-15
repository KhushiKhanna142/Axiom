import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useChatStore } from '../store/chat.store';

export function useMessages(roomId: string | null) {
  const { setMessages, messages } = useChatStore();

  const query = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data } = await api.get(`/rooms/${roomId}/messages`);
      setMessages(roomId, data.messages);
      return data.messages;
    },
    enabled: !!roomId,
  });

  return {
    messages: roomId ? (messages[roomId] || []) : [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
