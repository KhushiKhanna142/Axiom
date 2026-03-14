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
    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'rgba(10, 10, 15, 0.8)', flexShrink: 0, position: 'relative', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 24, right: 24, marginBottom: 8,
          background: 'rgba(30, 30, 45, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: 8, maxHeight: 180, overflowY: 'auto', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {suggestions.map((cmd) => (
            <button key={cmd}
              onClick={() => { setContent(cmd + ' '); setSuggestions([]); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 14, fontWeight: 500,
                color: 'hsl(var(--secondary))', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6,
                transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              {cmd}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            if (e.key === 'Escape') { setContent(''); setSuggestions([]); }
          }}
          placeholder={mode === 'command' ? 'Type a command...' : `Message #${roomId.slice(0, 8)}...`}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', fontSize: 15, outline: 'none',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', transition: 'all 0.3s ease'
          }}
          onFocus={(e) => { e.target.style.borderColor = 'hsl(var(--secondary))'; e.target.style.background = 'rgba(0,0,0,0.5)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.3)' }}
        />
        <button onClick={send}
          style={{
            padding: '0 24px', borderRadius: 12, background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', color: '#fff',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 4px 15px rgba(var(--primary), 0.3)', transition: 'transform 0.2s, filter 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}>
          Send
        </button>
      </div>
    </div>
  );
}
