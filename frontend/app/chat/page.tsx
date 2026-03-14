'use client';
export default function ChatDefaultPage() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Welcome to Axiom</h2>
        <p style={{ fontSize: 14 }}>Select a room from the sidebar to start chatting</p>
      </div>
    </div>
  );
}
