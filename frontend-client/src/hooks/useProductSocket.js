import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getProductToken } from '../services/api.js';

export const useProductSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getProductToken();
    if (!token) {
      console.warn('useProductSocket: token produit manquant, socket non connectée');
      return;
    }

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { productToken: token },
    });

    socketRef.current.on('connect', () => {
      console.log('Socket produit connectée');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
};