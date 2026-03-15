import { useChatStore } from '../store/chat.store';

export function usePresence(userId?: string) {
  const presence = useChatStore((s) => s.presence);

  if (userId) {
    return presence[userId] || false;
  }

  return presence;
}
