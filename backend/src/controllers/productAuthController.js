import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { isValidAge, isValidQuartier, isValidCategory } from '../utils/validators.js';
import { uploadMedia } from '../services/storage.js';

export const registerProductOwner = async (req, res, next) => {
  try {
    // 1. Récupérer les champs
    const { username, password, age, quartier, product } = req.body;

    // 2. Validations de base
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

    // 3. Validation du produit (objet imbriqué)
    if (!product || typeof product !== 'object') {
      return res.status(400).json({ error: 'Les informations du produit sont requises.' });
    }
    const { name, description, category, pricePerHour } = product;
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Le nom du produit doit contenir au moins 3 caractères.' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'La description doit contenir au moins 10 caractères.' });
    }
    if (!isValidCategory(category)) {
      return res.status(400).json({ error: 'La catégorie doit être F ou N.' });
    }
    const parsedPrice = parseFloat(pricePerHour);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Le prix doit être un nombre positif.' });
    }

    // 4. Gérer les fichiers uploadés (depuis req.files avec les noms product[mainPhoto], etc.)
    const mainPhotoFile = req.files?.['product[mainPhoto]']?.[0];
    if (!mainPhotoFile) {
      return res.status(400).json({ error: 'La photo principale est requise.' });
    }
    const additionalPhotoFiles = req.files?.['product[additionalPhotos]'] || [];
    const videoFile = req.files?.['product[video]']?.[0];

    // Upload vers Backblaze
    const mainPhotoUrl = await uploadMedia(mainPhotoFile, 'booking/products');
    const additionalPhotos = await Promise.all(
      additionalPhotoFiles.map((file) => uploadMedia(file, 'booking/products'))
    );
    const videoUrl = videoFile ? await uploadMedia(videoFile, 'booking/products') : null;

    // 5. Vérifier l'unicité du pseudo
    const existingOwner = await prisma.productOwner.findUnique({
      where: { username: username.trim() },
    });
    if (existingOwner) {
      return res.status(409).json({ error: 'Ce pseudo est déjà utilisé.' });
    }

    // 6. Hacher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // 7. Créer propriétaire et produit dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.productOwner.create({
        data: {
          username: username.trim(),
          passwordHash,
          age: Number(age),
          quartier: quartier.trim(),
        },
      });

      const newProduct = await tx.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          category: category,
          pricePerHour: parsedPrice,
          mainPhotoUrl,
          additionalPhotos,
          videoUrl,
          ownerId: owner.id,
        },
      });

      return { owner, product: newProduct };
    });

    // 8. Générer le token JWT
    const token = jwt.sign(
      {
        ownerId: result.owner.id,
        productId: result.product.id,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // 9. Réponse
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
    console.error('❌ ERREUR DANS REGISTER :', error);
    console.error('Détails :', error.message, error.stack);
    next(error);
  }
};

/**
 * Connexion d'un propriétaire existant

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