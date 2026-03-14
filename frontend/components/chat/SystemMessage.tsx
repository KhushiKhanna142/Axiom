export default function SystemMessage({ content }: { content: string }) {
  return (
    <div style={{
      padding: '8px 24px', background: 'rgba(255,255,255,0.03)', margin: '4px 20px',
      borderRadius: 8, borderLeft: '3px solid hsl(var(--primary))', display: 'flex', alignItems: 'center'
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{ content}</span>
    </div>
  );
}
