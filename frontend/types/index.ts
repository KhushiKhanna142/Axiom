export type GlobalRole = 'superadmin' | 'moderator' | 'member';
export type LocalRole = 'owner' | 'moderator' | 'member';

export const ROLE_WEIGHT: Record<GlobalRole, number> = {
  member: 0, moderator: 1, superadmin: 2
};

export interface User {
  id: string; username: string; email: string;
  role: GlobalRole; publicKey?: string;
  isOnline: boolean; lastSeen: string; createdAt: string;
}

export interface Room {
  id: string; name: string; description?: string;
  isPrivate: boolean; createdBy: string;
  isArchived: boolean; createdAt: string;
  memberCount?: number;
}

export interface RoomMember {
  userId: string; username: string;
  role: GlobalRole; localRole: LocalRole;
  isOnline: boolean; joinedAt: string;
}

export interface Message {
  id: string; roomId: string;
  senderId: string; senderUsername: string; senderRole: GlobalRole;
  content: string; isCommand: boolean; isSystem: boolean;
  editedAt?: string; deletedAt?: string; createdAt: string;
}

export interface DirectMessage {
  id: string; senderId: string; recipientId: string;
  ciphertext: string; nonce: string; createdAt: string;
  decryptedContent?: string;
}

export interface AuditEvent {
  id: number; event: string;
  actorId: string; targetId?: string; roomId?: string;
  metadata?: Record<string, unknown>;
  txHash?: string; onChain: boolean; createdAt: string;
}

export interface JwtPayload {
  userId: string; username: string;
  role: GlobalRole; iat: number; exp: number;
}

export interface ParsedCommand { command: string; args: string[]; }
