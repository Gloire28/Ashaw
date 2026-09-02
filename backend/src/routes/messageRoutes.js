import { Router } from 'express';
import { getMessages, sendMessage, requestMorePhotos } from '../controllers/messageController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/:conversationId', getMessages);
router.post('/:conversationId', upload.single('media'), sendMessage);
router.post('/:conversationId/photo-request', requestMorePhotos);

export default router;
