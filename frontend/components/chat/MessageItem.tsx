import { Message } from '../../types';
import Badge from '../ui/Badge';

export default function MessageItem({ message }: { message: Message }) {
  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (message.deletedAt) {
    return <div style={{ padding: '6px 24px', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>[deleted]</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 14, padding: '8px 24px', borderRadius: 8, transition: 'background 0.2s ease' }} className="msg-row">
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2, boxShadow: '0 2px 8px rgba(var(--primary), 0.2)' }}>
        {message.senderUsername?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{message.senderUsername || 'System'}</span>
          <Badge role={message.senderRole} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)', fontWeight: 500 }}>{time}</span>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', wordBreak: 'break-word', margin: 0, lineHeight: 1.5 }}>{message.content}</p>
      </div>
    </div>
  );
}
