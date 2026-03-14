'use client';
import { useState } from 'react';
import api from '../../lib/axios';
import { useChatStore } from '../../store/chat.store';

export default function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addRoom } = useChatStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/rooms', { name, description: description || undefined });
      addRoom(data.room);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div style={{ width: 420, padding: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 35, 0.85)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Create Room</h2>
          <button onClick={onClose} style={{ fontSize: 24, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>&times;</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. team-alpha"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: 'var(--text-primary)', fontSize: 15, outline: 'none', transition: 'all 0.3s ease' }}
              onFocus={e => e.currentTarget.style.borderColor = 'hsl(var(--secondary))'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Lowercase, 3-30 chars, letters/numbers/hyphens only</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this room about?"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: 'var(--text-primary)', fontSize: 15, outline: 'none', transition: 'all 0.3s ease' }}
              onFocus={e => e.currentTarget.style.borderColor = 'hsl(var(--secondary))'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ marginTop: 8, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(var(--primary), 0.3)', transition: 'transform 0.2s, filter 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}>
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
