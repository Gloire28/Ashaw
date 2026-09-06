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
    // 1. Récupérer le token admin depuis auth.token
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        // On suppose que le token admin contient un champ 'id' (l'identifiant de l'admin)
        if (decoded.id) {
          socket.isAdmin = true;
          socket.adminId = decoded.id;
          return next();
        }
      } catch (_) {
        // Token invalide, on continue
      }
    }

    // 2. Récupérer le token produit depuis auth.productToken ou query.productToken
    const productToken = socket.handshake.auth.productToken || socket.handshake.query.productToken;
    if (productToken) {
      try {
        const decoded = jwt.verify(productToken, config.jwtSecret);
        if (decoded.productId) {
          socket.isProduct = true;
          socket.productId = decoded.productId;
          socket.productOwnerId = decoded.ownerId;
          return next();
        }
      } catch (_) {
        // Token invalide, on continue
      }
    }

    // 3. Aucune authentification valide
    return next(new Error('Authentification requise (token admin ou produit)'));
  });

  io.on('connection', (socket) => {
    // Rejoindre une conversation (room)
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // L'admin rejoint la room globale
    if (socket.isAdmin) {
      socket.join('admin_room');
    }

    // Les produits rejoignent leur room personnelle (pour notifications)
    if (socket.isProduct && socket.productId) {
      socket.join(socket.productId);
    }

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io n'est pas initialisé");
  return io;
};