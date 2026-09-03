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

  io.use((socket, next) => {
    // 1. Récupération du sessionId depuis la query string (envoyé par le client)
    const sessionId = socket.handshake.query.sessionId;

    // 2. Récupération du token admin depuis l'objet auth (envoyé par le frontend admin)
    const token = socket.handshake.auth.token;

    // 3. Si un token est fourni, on tente de l'authentifier comme admin
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        socket.isAdmin = true;
        socket.admin = decoded; // optionnel
        // On garde aussi le sessionId si présent (utile pour l'admin)
        if (sessionId) socket.sessionId = sessionId;
        return next();
      } catch (_error) {
        // Token invalide : on ne bloque pas, on tente la suite
      }
    }

    // 4. Si pas de token admin valide, on tente une session client
    if (sessionId) {
      socket.sessionId = sessionId;
      return next();
    }

    // 5. Aucune authentification trouvée → refus
    return next(new Error('Authentification requise : sessionId ou token admin manquant'));
  });

  io.on('connection', (socket) => {
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

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