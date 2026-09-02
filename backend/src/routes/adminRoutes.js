import { Router } from 'express';
import { loginAdmin, logoutAdmin, getMe } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', protectAdmin, getMe);

export default router;
