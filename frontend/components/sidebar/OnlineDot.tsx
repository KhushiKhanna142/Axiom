export default function OnlineDot({ online }: { online: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: online ? 'var(--success)' : 'var(--text-muted)',
      transition: 'background-color 0.3s ease',
    }} />
  );
}
