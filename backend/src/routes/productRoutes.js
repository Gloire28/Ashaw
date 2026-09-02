import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
} from '../controllers/productController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

const productFiles = upload.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'additionalPhotos', maxCount: 8 },
  { name: 'video', maxCount: 1 },
]);

// Admin (routes littérales déclarées avant "/:id" pour éviter tout conflit)
router.get('/admin/all', protectAdmin, getAllProductsAdmin);
router.post('/', protectAdmin, productFiles, createProduct);
router.put('/:id', protectAdmin, productFiles, updateProduct);
router.patch('/:id/toggle', protectAdmin, toggleProductActive);
router.delete('/:id', protectAdmin, deleteProduct);

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
