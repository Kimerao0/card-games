import { io, Socket } from 'socket.io-client';
import type { IGameDetailsDto, IGameStateDto } from '@/dtos/Game';

type TGamePlayerJoinedHandler = (payload: IGameDetailsDto) => void;
type TGameStartedHandler = () => void;
type TGameStateUpdatedHandler = (state: IGameStateDto) => void;
type TGameDeletedHandler = () => void;

let socket: Socket | null = null;

const SOCKET_URL = `http://${window.location.hostname}:3000`;

export const connectSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};

export const joinGameRoom = (gameId: string): void => {
  if (!socket) return;
  socket.emit('game:join-room', { gameId });
};

export const leaveGameRoom = (gameId: string): void => {
  if (!socket) return;
  socket.emit('game:leave-room', { gameId });
};

const on = <THandler extends (...args: any[]) => void>(event: string, handler: THandler): (() => void) => {
  if (!socket) return () => undefined;

  socket.on(event, handler);

  return () => {
    socket?.off(event, handler);
  };
};

export const onGamePlayerJoined = (handler: TGamePlayerJoinedHandler): (() => void) => {
  return on('game:player-joined', handler);
};

export const onGameStarted = (handler: TGameStartedHandler): (() => void) => {
  return on('game:started', handler);
};

export const onGameStateUpdated = (handler: TGameStateUpdatedHandler): (() => void) => {
  return on('game:state-updated', handler);
};

export const onGameDeleted = (handler: TGameDeletedHandler): (() => void) => {
  return on('game:deleted', handler);
};

// (Opzionale) getter per debug
export const getSocket = (): Socket | null => socket;
