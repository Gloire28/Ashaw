import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Middleware global (appliqué à toutes les requêtes) : tente d'identifier
// l'admin via le header Authorization sans jamais bloquer la requête. Utile
// car les routes de chat sont partagées entre client et admin.
// Le token n'est plus un cookie (bloqué cross-site par Safari/iOS) : le
// frontend admin l'envoie explicitement en "Authorization: Bearer <token>".
export const identifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      req.admin = jwt.verify(token, config.jwtSecret);
    } catch (_error) {
      // token invalide ou expiré : on continue simplement en tant que client
    }
  }
  next();
};

// Middleware de protection à poser sur les routes réservées à l'admin.
// S'appuie sur identifyAdmin, déjà exécuté en amont dans server.js.
export const protectAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: 'Non autorisé, connexion admin requise' });
  }
  next();
};
