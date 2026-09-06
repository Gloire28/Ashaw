import { Router } from 'express';
import {
  startConversation,
  getMyConversations,
  getConversationById,
  sendMessage,
} from '../controllers/conversationController.js';
import { protectProduct } from '../middleware/productAuthMiddleware.js';

const router = Router();

// Routes protégées par authentification produit
router.post('/', protectProduct, startConversation);
router.get('/mine', protectProduct, getMyConversations);
router.get('/:id', protectProduct, getConversationById);
router.post('/:conversationId/messages', protectProduct, sendMessage);

export default router;