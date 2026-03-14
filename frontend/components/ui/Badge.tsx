import { GlobalRole } from '../../types';

const STYLES: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'OWNER', color: 'var(--danger)' },
  moderator: { label: 'MOD', color: 'var(--warning)' },
};

export default function Badge({ role }: { role?: GlobalRole | string }) {
  if (!role || !STYLES[role]) return null;
  const { label, color } = STYLES[role];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color, textTransform: 'uppercase' }}>
      {label}
    </span>
  );
}
