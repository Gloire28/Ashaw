import { Router } from 'express';
import { loginAdmin, logoutAdmin, getMe } from '../controllers/adminController.js';
import {
  getAllConversationsAdmin,
  activateConversation,
  deleteConversation,
} from '../controllers/adminConversationController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminConversationController.js';

const router = Router();

// Authentification admin
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', protectAdmin, getMe);

// Gestion des conversations (routes admin)
router.get('/conversations', protectAdmin, getAllConversationsAdmin);
router.patch('/conversations/:id/activate', protectAdmin, activateConversation);
router.delete('/conversations/:id', protectAdmin, deleteConversation);
router.get('/dashboard/stats', protectAdmin, getDashboardStats);

export default router;