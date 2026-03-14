import { Message } from '../../types';
import Badge from '../ui/Badge';

export default function MessageItem({ message }: { message: Message }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (message.deletedAt) {
    return <div style={{ padding: '4px 24px', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>[deleted]</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 12, padding: '4px 24px', borderRadius: 6 }} className="msg-row">
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>
        {message.senderUsername[0]?.toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{message.senderUsername}</span>
          <Badge role={message.senderRole} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono)' }}>{time}</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', wordBreak: 'break-word', margin: 0 }}>{message.content}</p>
      </div>
    </div>
  );
}
