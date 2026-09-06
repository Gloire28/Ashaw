import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Middleware non bloquant : tente d'identifier un propriétaire de produit
 * via le token JWT présent dans l'en-tête 'X-Product-Token'.
 * Attache `req.productOwnerId` et `req.productId` si valide.
 * Ne bloque jamais la requête.
 */
export const identifyProduct = (req, res, next) => {
  const token = req.headers['x-product-token'];
  if (token && typeof token === 'string') {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.ownerId && decoded.productId) {
        req.productOwnerId = decoded.ownerId;
        req.productId = decoded.productId;
      }
    } catch (_error) {
      // Token invalide/expiré : on ignore et on continue
    }
  }
  next();
};

/**
 * Middleware bloquant : protège les routes nécessitant une authentification produit.
 * Doit être utilisé après `identifyProduct` (ou après un autre middleware qui remplit `req.productId`).
 * Renvoie 401 si aucun produit n'est identifié.
 */
export const protectProduct = (req, res, next) => {
  if (!req.productId) {
    return res.status(401).json({ error: 'Authentification produit requise.' });
  }
  next();
};