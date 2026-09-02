import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });
    socket.on('connect', () => socket.emit('join_admin'));
    socketRef.current = socket;

    return () => socket.disconnect();
  }, []);

  return socketRef;
};
