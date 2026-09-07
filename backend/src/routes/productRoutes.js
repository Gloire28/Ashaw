import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getMyProduct,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
} from '../controllers/productController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { identifyProduct, protectProduct } from '../middleware/productAuthMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

const productFiles = upload.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'additionalPhotos', maxCount: 8 },
  { name: 'video', maxCount: 1 },
]);

// --- Routes admin (protégées par protectAdmin) ---
router.get('/admin/all', protectAdmin, getAllProductsAdmin);
router.post('/', protectAdmin, productFiles, createProduct);
router.put('/:id', protectAdmin, productFiles, updateProduct);
router.patch('/:id/toggle', protectAdmin, toggleProductActive);
router.delete('/:id', protectAdmin, deleteProduct);

// --- Route protégée pour le produit connecté ---
router.get('/me', identifyProduct, protectProduct, getMyProduct);

// identifyProduct est non bloquant : si un token produit est présent, il ajoute req.productId
router.get('/', identifyProduct, getProducts);
router.get('/:id', identifyProduct, getProductById);

export default router;