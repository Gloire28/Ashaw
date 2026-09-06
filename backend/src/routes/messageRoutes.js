import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/:conversationId', getMessages);
router.post('/:conversationId', upload.single('media'), sendMessage);

export default router;
