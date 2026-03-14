'use client';
import { useState } from 'react';
import AuditLog from './AuditLog';
import UserManager from './UserManager';

export default function AdminPanel({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'users' | 'audit'>('audit');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div style={{ width: 720, maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'rgba(25, 25, 35, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {(['audit', 'users'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: '12px 0', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  borderBottom: t === tab ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                  background: 'none', color: t === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s ease',
                  marginBottom: '-1px'
                }}>
                {t === 'audit' ? 'Audit Log' : 'User Manager'}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            style={{ fontSize: 24, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, paddingBottom: 12, transition: 'color 0.2s ease' }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            &times;
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {tab === 'audit' ? <AuditLog roomId={roomId} /> : <UserManager />}
        </div>
      </div>
    </div>
  );
}
