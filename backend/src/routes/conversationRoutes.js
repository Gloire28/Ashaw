import { Router } from 'express';
import {
  startConversation,
  getMyConversations,
  getConversationById,
  getAllConversationsAdmin,
  archiveConversation,
  getDashboardStats,
} from '../controllers/conversationController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Routes littérales déclarées avant "/:id"
router.post('/', startConversation);
router.get('/mine', getMyConversations);
router.get('/admin/all', protectAdmin, getAllConversationsAdmin);
router.get('/admin/stats', protectAdmin, getDashboardStats);

router.get('/:id', getConversationById);
router.patch('/:id/archive', protectAdmin, archiveConversation);

export default router;
