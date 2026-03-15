import { getSocket } from '../lib/socket';

export function useCommand(roomId: string) {
  const executeCommand = (commandString: string) => {
    if (!commandString.startsWith('/')) return false;

    const socket = getSocket();
    socket.emit('message:send', { roomId, content: commandString });
    return true;
  };

  return { executeCommand };
}
