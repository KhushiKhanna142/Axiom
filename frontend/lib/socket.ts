import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: currentToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  } else {
    // If socket exists but token changed (e.g. user just logged in), update auth and reconnect
    const socketAuth = socket.auth as { token?: string | null };
    if (socketAuth.token !== currentToken) {
      socketAuth.token = currentToken;
      socket.disconnect();
      socket.connect();
    }
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
