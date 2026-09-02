import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/index.js';
import { identifyAdmin } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { initSocket } from './config/socket.js';
import { startCleanupJobs } from './services/cleanupService.js';

import productRoutes from './routes/productRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // "origin" est undefined pour les requêtes sans navigateur (curl, health check…)
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origine non autorisée (CORS)'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(identifyAdmin);

app.use('/api/products', productRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);
startCleanupJobs();

httpServer.listen(config.port, () => {
  console.log(`Serveur Booking lancé sur le port ${config.port}`);
});
