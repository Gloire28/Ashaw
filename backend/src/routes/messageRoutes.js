import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/conversationController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { identifyProduct } from '../middleware/productAuthMiddleware.js';

const router = Router();

router.get('/:conversationId', identifyProduct, getMessages);
router.post('/:conversationId', upload.single('media'), identifyProduct, sendMessage);

export default router;
