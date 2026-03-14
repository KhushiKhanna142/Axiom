export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  unauthorized: () => new AppError(401, 'unauthorized', 'Authentication required'),
  tokenExpired: () => new AppError(401, 'token_expired', 'Session expired. Please log in again'),
  forbidden: () => new AppError(403, 'forbidden', 'Insufficient role'),
  roomForbidden: () => new AppError(403, 'room_forbidden', 'Insufficient room role'),
  notMember: () => new AppError(403, 'not_member', 'You are not a member of this room'),
  roomNotFound: () => new AppError(404, 'room_not_found', 'Room does not exist'),
  userNotFound: () => new AppError(404, 'user_not_found', 'User does not exist'),
  alreadyMember: () => new AppError(409, 'already_member', 'User is already in this room'),
  conflict: () => new AppError(409, 'conflict', 'Username or email already in use'),
  invalidTarget: () => new AppError(400, 'invalid_target', 'You cannot kick yourself'),
  protectedRole: () => new AppError(403, 'protected_role', 'Superadmin role cannot be changed'),
  messageTooLong: () => new AppError(400, 'message_too_long', 'Message exceeds 4000 character limit'),
  rateLimitExceeded: () => new AppError(429, 'rate_limit_exceeded', 'Too many messages. Wait 60 seconds'),
};
