import React from 'react';
import Badge from '../ui/Badge';
import OnlineDot from './OnlineDot';
import Avatar from '../ui/Avatar';
import DMPane from '../dm/DMPane';
import { RoomMember, User } from '../../types';

interface UserListProps {
  members: RoomMember[];
  title?: string;
}

export default function UserList({ members, title = 'Members' }: UserListProps) {
  const [activeDmUser, setActiveDmUser] = React.useState<User | null>(null);

  if (!members || members.length === 0) {
    return null;
  }

  // Group by online status
  const onlineMembers = members.filter((m) => m.isOnline);
  const offlineMembers = members.filter((m) => !m.isOnline);

  const renderGroup = (groupTitle: string, groupMembers: RoomMember[]) => {
    if (groupMembers.length === 0) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
            padding: '0 16px',
          }}
        >
          {groupTitle} — {groupMembers.length}
        </h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {groupMembers.map((member) => (
            <li
              key={member.userId}
              onClick={() => setActiveDmUser({
                id: member.userId,
                username: member.username,
                role: member.role,
                isOnline: member.isOnline,
                email: '', // Not needed for DM Pane UI
                createdAt: '',
                lastSeen: '',
              })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar username={member.username} size={28} />
                <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                  <OnlineDot online={member.isOnline} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 14,
                    color: member.isOnline ? 'var(--text-primary)' : 'var(--text-secondary)',
                    opacity: member.isOnline ? 1 : 0.7,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {member.username}
                </span>
              </div>
              <Badge role={member.role} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      style={{
        width: 240,
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontSize: 14,
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {renderGroup('Online', onlineMembers)}
        {renderGroup('Offline', offlineMembers)}
      </div>

      {activeDmUser && (
        <DMPane
          recipient={activeDmUser}
          onClose={() => setActiveDmUser(null)}
        />
      )}
    </div>
  );
}
