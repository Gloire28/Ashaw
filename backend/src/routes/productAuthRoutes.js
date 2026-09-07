import { Router } from 'express';
import { registerProductOwner, loginProductOwner } from '../controllers/productAuthController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

const productFiles = upload.fields([
  { name: 'product[mainPhoto]', maxCount: 1 },
  { name: 'product[additionalPhotos]', maxCount: 8 },
  { name: 'product[video]', maxCount: 1 },
]);

router.post('/register', productFiles, registerProductOwner);
router.post('/login', loginProductOwner);

export default router;