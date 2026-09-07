import prisma from '../config/database.js';
import { uploadMedia } from '../services/storage.js';

// --- Public (avec filtrage par catégorie) ---

/**
 * Récupère tous les produits actifs.
 * Si un propriétaire est connecté (req.productId), ne renvoie que les produits
 * de la catégorie opposée à son propre produit.
 * Si admin (req.admin), renvoie tous les produits (pour la gestion).
 * Sinon, renvoie tous les produits (cas où l'utilisateur n'est pas connecté,
 * par exemple pour le catalogue public).
 */
export const getProducts = async (req, res, next) => {
  try {
    // Si admin connecté, il voit tout (gestion)
    if (req.admin) {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(products);
    }

    // Si propriétaire connecté, filtrer par catégorie opposée
    if (req.productId) {
      const myProduct = await prisma.product.findUnique({
        where: { id: req.productId },
        select: { category: true },
      });
      if (!myProduct) {
        return res.status(404).json({ error: 'Produit introuvable.' });
      }

      const oppositeCategory = myProduct.category === 'F' ? 'N' : 'F';
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          category: oppositeCategory,
          NOT: { id: req.productId }, // exclure son propre produit
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(products);
    }

    // Aucune authentification : renvoyer tous les produits actifs (catalogue public)
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un produit par son ID.
 * - Admin : voit tout.
 * - Propriétaire : voit le produit s'il est de catégorie opposée (ou le sien).
 * - Sinon, public : voir le produit s'il est actif.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    // Admin voit tout
    if (req.admin) {
      return res.json(product);
    }

    // Propriétaire connecté : voir son propre produit ou ceux de catégorie opposée
    if (req.productId) {
      const myProduct = await prisma.product.findUnique({
        where: { id: req.productId },
        select: { category: true },
      });
      if (myProduct && (req.productId === product.id || product.category !== myProduct.category)) {
        return res.json(product);
      }
      return res.status(403).json({ error: 'Accès refusé à ce produit.' });
    }

    // Public : produit visible s'il est actif
    if (product.isActive) {
      return res.json(product);
    }
    return res.status(404).json({ error: 'Produit introuvable ou désactivé.' });
  } catch (error) {
    next(error);
  }
};


export const getMyProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.productId },
      include: { owner: true },
    });

    console.log('📦 Produit récupéré pour dashboard :', product);

    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// --- Admin (gestion des produits) ---

export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { owner: true },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, pricePerHour, ownerId } = req.body;

    if (!name || !description || !category || !pricePerHour || !ownerId) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }

    const mainPhotoFile = req.files?.mainPhoto?.[0];
    if (!mainPhotoFile) {
      return res.status(400).json({ error: 'Photo principale requise.' });
    }

    const mainPhotoUrl = await uploadMedia(mainPhotoFile, 'booking/products');
    const additionalPhotos = req.files?.additionalPhotos
      ? await Promise.all(req.files.additionalPhotos.map((f) => uploadMedia(f, 'booking/products')))
      : [];
    const videoUrl = req.files?.video?.[0]
      ? await uploadMedia(req.files.video[0], 'booking/products')
      : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        pricePerHour: Number(pricePerHour),
        mainPhotoUrl,
        additionalPhotos,
        videoUrl,
        ownerId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    const data = { ...req.body };
    if (data.pricePerHour) data.pricePerHour = Number(data.pricePerHour);

    const mainPhotoFile = req.files?.mainPhoto?.[0];
    const additionalPhotoFiles = req.files?.additionalPhotos || [];
    const videoFile = req.files?.video?.[0];

    if (mainPhotoFile) {
      data.mainPhotoUrl = await uploadMedia(mainPhotoFile, 'booking/products');
    }
    if (additionalPhotoFiles.length > 0) {
      const uploaded = await Promise.all(
        additionalPhotoFiles.map((f) => uploadMedia(f, 'booking/products'))
      );
      data.additionalPhotos = [...existing.additionalPhotos, ...uploaded];
    }
    if (videoFile) {
      data.videoUrl = await uploadMedia(videoFile, 'booking/products');
    }

    const product = await prisma.product.update({ where: { id }, data });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const toggleProductActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }
    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};