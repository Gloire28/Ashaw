import { Router } from 'express';
import { registerProductOwner, loginProductOwner } from '../controllers/productAuthController.js';

const router = Router();

// Inscription d'un nouveau propriétaire + produit
router.post('/register', registerProductOwner);

// Connexion d'un propriétaire existant
router.post('/login', loginProductOwner);

export default router;