import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSessionId } from '../services/api.js';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // sessionId envoyé explicitement (le serveur le lisait déjà en fallback
    // depuis la query string) — plus besoin du cookie cross-site pour le
    // handshake Socket.io.
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      query: { sessionId: getSessionId() },
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
};
