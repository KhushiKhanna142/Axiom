'use client';
import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chat.store';
import MessageItem from './MessageItem';
import SystemMessage from './SystemMessage';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ roomId }: { roomId: string }) {
  const messages = useChatStore((s) => s.messages[roomId] || []);
  const typing = useChatStore((s) => s.typing[roomId] || []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      {messages.map((msg) =>
        msg.isSystem
          ? <SystemMessage key={msg.id} content={msg.content} />
          : <MessageItem key={msg.id} message={msg} />
      )}
      {typing.length > 0 && <TypingIndicator users={typing} />}
      <div ref={bottomRef} />
    </div>
  );
}
