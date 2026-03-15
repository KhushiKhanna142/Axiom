import React, { useState, useEffect, useRef } from 'react';
import { DirectMessage, User } from '../../types';
import DMBubble from './DMBubble';
import { useAuthStore } from '../../store/auth.store';
import { encryptDM, decryptDM } from '../../lib/e2ee';
import api from '../../lib/axios';

interface DMPaneProps {
  recipient: User;
  onClose: () => void;
}

export default function DMPane({ recipient, onClose }: DMPaneProps) {
  const { user, encryptedPrivateKey, keySalt } = useAuthStore();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  // TODO: Add logic to fetch DMs and handle socket events for DMs once backend supports it.

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation this would decrypt the private key using the password.
    // For scaffolding, we just clear the error.
    setError('Decryption not yet implemented in scaffolding.');
  };

  const handleSend = async () => {
    if (!input.trim() || !user || !privateKey || !recipient.publicKey) return;
    
    try {
      const { ciphertext, nonce } = encryptDM(input, recipient.publicKey, privateKey);
      
      // Temporary optimistic UI update for scaffolding
      const tempMsg: DirectMessage = {
        id: crypto.randomUUID(),
        senderId: user.id,
        recipientId: recipient.id,
        ciphertext,
        nonce,
        createdAt: new Date().toISOString(),
        decryptedContent: input,
      };
      
      setMessages((prev) => [...prev, tempMsg]);
      setInput('');
      
    } catch (e: any) {
      setError('Failed to encrypt message.');
    }
  };

  return (
    <div
      style={{
        width: 350,
        height: 480,
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 40,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-sidebar)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: recipient.isOnline ? 'var(--success)' : 'var(--text-muted)',
            }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {recipient.username}
          </span>
          <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 4 }}>
            E2EE
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>
          &times;
        </button>
      </div>

      {!privateKey ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ marginBottom: 16, fontSize: 32 }}>🔒</div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Direct messages are end-to-end encrypted. Enter your password to unlock your private key.
          </p>
          <form onSubmit={handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              placeholder="Account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
              }}
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
            <button
              type="submit"
              style={{ padding: '8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}
            >
              Unlock Messages
            </button>
          </form>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                No encrypted messages yet.
              </div>
            ) : (
              messages.map((m) => <DMBubble key={m.id} message={m} isOwn={m.senderId === user?.id} />)
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--border)', background: 'var(--bg-sidebar)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Encrypted message..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
