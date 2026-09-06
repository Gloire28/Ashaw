import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { isValidAge, isValidQuartier, isValidCategory } from '../utils/validators.js';

/**
 * Inscription d'un nouveau propriétaire avec création simultanée du produit
 * Body attendu :
 * {
 *   username: string,
 *   password: string,
 *   age: number,
 *   quartier: string,
 *   product: {
 *     name: string,
 *     description: string,
 *     category: 'F' | 'N',
 *     pricePerHour: number,
 *     mainPhotoUrl: string,
 *     additionalPhotos?: string[],
 *     videoUrl?: string
 *   }
 * }
 */
export const registerProductOwner = async (req, res, next) => {
  try {
    const { username, password, age, quartier, product } = req.body;

    // 1. Validations de base
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Le pseudo doit contenir au moins 3 caractères.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }
    if (!isValidAge(age)) {
      return res.status(400).json({ error: 'Âge invalide (doit être entre 13 et 120 ans).' });
    }
    if (!isValidQuartier(quartier)) {
      return res.status(400).json({ error: 'Le quartier est requis.' });
    }

    // 2. Validation du produit
    if (!product || typeof product !== 'object') {
      return res.status(400).json({ error: 'Les informations du produit sont requises.' });
    }
    const { name, description, category, pricePerHour, mainPhotoUrl } = product;
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Le nom du produit doit contenir au moins 3 caractères.' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'La description doit contenir au moins 10 caractères.' });
    }
    if (!isValidCategory(category)) {
      return res.status(400).json({ error: 'La catégorie doit être F ou N.' });
    }
    if (typeof pricePerHour !== 'number' || pricePerHour <= 0) {
      return res.status(400).json({ error: 'Le prix doit être un nombre positif.' });
    }
    if (!mainPhotoUrl || typeof mainPhotoUrl !== 'string') {
      return res.status(400).json({ error: 'La photo principale est requise.' });
    }

    // 3. Vérifier l'unicité du pseudo
    const existingOwner = await prisma.productOwner.findUnique({
      where: { username: username.trim() },
    });
    if (existingOwner) {
      return res.status(409).json({ error: 'Ce pseudo est déjà utilisé.' });
    }

    // 4. Hacher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Créer le propriétaire et le produit dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le propriétaire
      const owner = await tx.productOwner.create({
        data: {
          username: username.trim(),
          passwordHash,
          age: Number(age),
          quartier: quartier.trim(),
        },
      });

      // Créer le produit lié au propriétaire
      const newProduct = await tx.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          category,
          pricePerHour,
          mainPhotoUrl: mainPhotoUrl.trim(),
          additionalPhotos: product.additionalPhotos || [],
          videoUrl: product.videoUrl || null,
          ownerId: owner.id,
        },
      });

      return { owner, product: newProduct };
    });

    // 6. Générer le token JWT (contient ownerId et productId)
    const token = jwt.sign(
      {
        ownerId: result.owner.id,
        productId: result.product.id,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // 7. Réponse
    res.status(201).json({
      token,
      owner: {
        id: result.owner.id,
        username: result.owner.username,
        age: result.owner.age,
        quartier: result.owner.quartier,
      },
      product: result.product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un propriétaire existant
 * Body attendu : { username, password }
 */
export const loginProductOwner = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Identifiants requis.' });
    }

    // Récupérer le propriétaire avec son produit
    const owner = await prisma.productOwner.findUnique({
      where: { username: username.trim() },
      include: { product: true },
    });

    if (!owner) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, owner.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    // Générer le token
    const token = jwt.sign(
      {
        ownerId: owner.id,
        productId: owner.product.id,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      owner: {
        id: owner.id,
        username: owner.username,
        age: owner.age,
        quartier: owner.quartier,
      },
      product: owner.product,
    });
  } catch (error) {
    next(error);
  }
};