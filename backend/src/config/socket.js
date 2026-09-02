import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.allowedOrigins,
      credentials: true,
    },
  });

  // Deux profils peuvent se connecter : un client (cookie sessionId) ou l'admin
  // (cookie adminToken, vérifié comme sur les routes HTTP protégées).
  // Le sessionId accepte aussi un fallback en query string si le cookie n'est pas transmis.
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie || '';
    const sessionMatch = cookieHeader.match(/sessionId=([^;]+)/);
    const adminMatch = cookieHeader.match(/adminToken=([^;]+)/);
    const sessionId = sessionMatch?.[1] || socket.handshake.query.sessionId;

    if (adminMatch?.[1]) {
      try {
        jwt.verify(adminMatch[1], config.jwtSecret);
        socket.isAdmin = true;
        return next();
      } catch (_error) {
        // token admin invalide/expiré : on retente en tant que client ci-dessous
      }
    }

    if (sessionId) {
      socket.sessionId = sessionId;
      return next();
    }

    return next(new Error('Authentification requise'));
  });

  io.on('connection', (socket) => {
    // Le client rejoint la room de sa conversation pour recevoir les messages en temps réel
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // L'admin rejoint une room globale pour être notifié de toute activité
    socket.on('join_admin', () => {
      if (socket.isAdmin) {
        socket.join('admin_room');
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io n'est pas initialisé");
  return io;
};
