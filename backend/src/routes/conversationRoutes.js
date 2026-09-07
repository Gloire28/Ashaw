import { Router } from 'express';
import {
  startConversation,
  getMyConversations,
  getConversationById,
  sendMessage,
} from '../controllers/conversationController.js';
import { identifyProduct, protectProduct } from '../middleware/productAuthMiddleware.js';

const router = Router();

// Routes protégées par authentification produit
router.post('/', identifyProduct, protectProduct, startConversation);
router.get('/mine', identifyProduct, protectProduct, getMyConversations);
router.get('/:id', identifyProduct, getConversationById);
router.post('/:conversationId/messages', identifyProduct, sendMessage);

export default router;