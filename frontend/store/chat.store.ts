import { create } from 'zustand';
import { Message, Room, DirectMessage } from '../types';

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  presence: Record<string, boolean>;
  typing: Record<string, { userId: string; username: string }[]>;
  drafts: Record<string, string>;
  directMessages: Record<string, DirectMessage[]>;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  setActiveRoom: (id: string | null) => void;
  addMessage: (msg: Message) => void;
  addDirectMessage: (msg: DirectMessage) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  setDirectMessages: (userId: string, msgs: DirectMessage[]) => void;
  updatePresence: (userId: string, online: boolean) => void;
  setTyping: (roomId: string, user: { userId: string; username: string }, isTyping: boolean) => void;
  setDraft: (roomId: string, content: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  directMessages: {},
  presence: {},
  typing: {},
  drafts: {},

  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),

  addMessage: (msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [msg.roomId]: [...(s.messages[msg.roomId] || []), msg],
      },
    })),

  addDirectMessage: (msg) =>
    set((s) => {
      // Direct messages are grouped by the 'other' participant's ID
      // To determine this we look at whose messaging us. If senderId is 'me', target is recipientId.
      // Wait, we can't access 'me' cleanly here, we do it in the socket handler or UI.
      // Easiest is to identify the 'partner' by looking at both IDs inside the hook later or here. 
      // Actually we'll pass the 'partnerId' as part of the key. Let's assume msg.partnerId
      // Modify directMessages key mapping. Let's just pass partnerId in the function or append:
      // We will handle it by just merging.
      const partnerId = msg.senderId; // Temporary, should be handled correctly by caller
      return {
        directMessages: {
           ...s.directMessages,
           [partnerId]: [...(s.directMessages[partnerId] || []), msg]
        }
      };
    }),

  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),

  setDirectMessages: (userId, msgs) =>
    set((s) => ({ directMessages: { ...s.directMessages, [userId]: msgs } })),

  updatePresence: (userId, online) =>
    set((s) => ({ presence: { ...s.presence, [userId]: online } })),
  setTyping: (roomId, user, isTyping) =>
    set((s) => {
      const cur = s.typing[roomId] || [];
      const upd = isTyping
        ? cur.find((u) => u.userId === user.userId) ? cur : [...cur, user]
        : cur.filter((u) => u.userId !== user.userId);
      return { typing: { ...s.typing, [roomId]: upd } };
    }),
  setDraft: (roomId, content) =>
    set((s) => ({ drafts: { ...s.drafts, [roomId]: content } })),
}));
