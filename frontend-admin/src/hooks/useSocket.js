import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAdminToken } from '../services/api.js'; 

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getAdminToken();
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      
    });

    socket.on('connect', () => {
      socket.emit('join_admin');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
};