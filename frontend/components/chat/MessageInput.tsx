'use client';
import { useState, useRef } from 'react';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';

const COMMANDS_BY_ROLE: Record<string, string[]> = {
  member: ['/help', '/online', '/history'],
  moderator: ['/help', '/online', '/history', '/kick', '/create-room', '/archive-room'],
  superadmin: ['/help', '/online', '/history', '/kick', '/promote', '/demote', '/ban', '/create-room', '/archive-room', '/audit'],
};

export default function MessageInput({ roomId }: { roomId: string }) {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'normal' | 'command'>('normal');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { setDraft } = useChatStore();
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const onChange = (val: string) => {
    setContent(val);
    setDraft(roomId, val);
    if (val.startsWith('/')) {
      setMode('command');
      const available = COMMANDS_BY_ROLE[user?.role || 'member'] || [];
      setSuggestions(available.filter((c) => c.startsWith(val)));
    } else {
      setMode('normal');
      setSuggestions([]);
    }
    const socket = getSocket();
    socket.emit('typing:start', { roomId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', { roomId }), 2000);
  };

  const send = () => {
    if (!content.trim()) return;
    getSocket().emit('message:send', { roomId, content: content.trim() });
    setContent('');
    setSuggestions([]);
    setMode('normal');
  };

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0, position: 'relative' }}>
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 16, right: 16, marginBottom: 4,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
          padding: 4, maxHeight: 180, overflowY: 'auto',
        }}>
          {suggestions.map((cmd) => (
            <button key={cmd}
              onClick={() => { setContent(cmd + ' '); setSuggestions([]); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 13,
                color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4,
              }}>
              {cmd}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            if (e.key === 'Escape') { setContent(''); setSuggestions([]); }
          }}
          placeholder={mode === 'command' ? 'Type a command...' : `Message #${roomId.slice(0, 8)}...`}
          style={{
            flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={send}
          style={{
            padding: '9px 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff',
            border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14,
          }}>
          Send
        </button>
      </div>
    </div>
  );
}
