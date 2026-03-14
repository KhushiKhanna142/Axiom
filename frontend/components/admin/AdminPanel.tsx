'use client';
import { useState } from 'react';
import AuditLog from './AuditLog';
import UserManager from './UserManager';

export default function AdminPanel({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'users' | 'audit'>('audit');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ width: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {(['audit', 'users'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: '8px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                  borderBottom: t === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'none', color: t === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}>
                {t === 'audit' ? 'Audit Log' : 'User Manager'}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            style={{ fontSize: 18, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>
            &times;
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {tab === 'audit' ? <AuditLog roomId={roomId} /> : <UserManager />}
        </div>
      </div>
    </div>
  );
}
