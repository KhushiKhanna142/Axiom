'use client';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function AuditLog({ roomId }: { roomId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['audit', roomId],
    queryFn: async () => {
      const { data } = await api.get('/users/audit', { params: { roomId } });
      return data.events;
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Admin actions — permanently recorded on Polygon Amoy testnet
        </p>
        <a
          href="https://amoy.polygonscan.com/address/0xd9145CCE52D386f254917e481eB44e9943F39138"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
          View Contract &rarr;
        </a>
      </div>

      {isLoading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>}
      {!isLoading && (!data || !data.length) && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          No audit events yet. Perform an admin action to create the first on-chain record.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(data || []).map((ev: any) => (
          <div key={ev.id} style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-bg)', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                    {ev.event}
                  </span>
                  {ev.on_chain && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}>
                      ON-CHAIN
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                  {new Date(ev.created_at).toLocaleString()}
                </p>
              </div>
              {ev.tx_hash ? (
                <a
                  href={`https://amoy.polygonscan.com/tx/${ev.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12, fontFamily: 'var(--font-geist-mono)', color: 'var(--accent)',
                    border: '1px solid var(--accent)', padding: '3px 8px', borderRadius: 4,
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                  {ev.tx_hash.slice(0, 10)}... Polygonscan
                </a>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--warning)', padding: '3px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)' }}>
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
