'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Badge from '../ui/Badge';
import OnlineDot from '../sidebar/OnlineDot';

export default function UserManager() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.users;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(data || []).map((u: any) => (
        <div key={u.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        }}>
          <OnlineDot online={u.is_online} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{u.username}</span>
            {' '}
            <Badge role={u.role} />
          </div>
          {u.role !== 'superadmin' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {['moderator', 'member'].map((r) => (
                <button key={r}
                  onClick={() => mutation.mutate({ id: u.id, role: r })}
                  disabled={u.role === r || mutation.isPending}
                  style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 4,
                    border: '1px solid var(--border)',
                    background: u.role === r ? 'var(--accent-bg)' : 'transparent',
                    color: u.role === r ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
