export default function SystemMessage({ content }: { content: string }) {
  return (
    <div style={{
      padding: '6px 24px', background: 'var(--system-msg)', margin: '4px 16px',
      borderRadius: 6, borderLeft: '3px solid var(--accent)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{'> '}{content}</span>
    </div>
  );
}
