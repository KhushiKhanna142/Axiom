'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/auth.store';
import api from '../../../lib/axios';
export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register
      await api.post('/auth/register', { 
        username, email, password
      });

      // 2. Auto-login
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      router.replace('/chat');
      
    } catch (err: any) {
      if (err.response?.data?.details?.fieldErrors) {
        const errors = err.response.data.details.fieldErrors;
        const messages = Object.keys(errors).map(key => `${key}: ${errors[key][0]}`).join(', ');
        setError(`Validation error - ${messages}`);
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, position: 'relative' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(var(--primary), 0.15) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: -1 }}></div>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))', padding: 16, borderRadius: 16, marginBottom: 16, boxShadow: '0 8px 32px rgba(var(--primary), 0.3)', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32 }}>⚡</span>
          </div>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: 40, fontWeight: 700 }}>Axiom</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center' }}>Create your account to start chatting.</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 24, textAlign: 'center', fontSize: 14 }}>{error}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
            <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="glass-input" placeholder="coolhacker99" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input" placeholder="you@axiom.dev" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required className="glass-input" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14, marginTop: 16 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'underline' }}>
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
