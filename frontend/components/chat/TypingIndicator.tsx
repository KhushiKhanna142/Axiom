export default function TypingIndicator({ users }: { users: { userId: string }[] }) {
  if (!users.length) return null;
  return (
    <div style={{ padding: '4px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)',
            display: 'inline-block', animation: `bounce 1.4s ${i * 0.2}s infinite`,
          }} />
        ))}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{users.length} typing...</span>
    </div>
  );
}
