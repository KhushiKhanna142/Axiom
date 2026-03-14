import { create } from 'zustand';
import { Message, Room } from '../types';

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  presence: Record<string, boolean>;
  typing: Record<string, { userId: string; username: string }[]>;
  drafts: Record<string, string>;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  setActiveRoom: (id: string | null) => void;
  addMessage: (msg: Message) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  updatePresence: (userId: string, online: boolean) => void;
  setTyping: (roomId: string, user: { userId: string; username: string }, isTyping: boolean) => void;
  setDraft: (roomId: string, content: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
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
  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),
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
