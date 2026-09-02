import prisma from '../config/database.js';
import { uploadMedia } from '../services/storage.js';

// --- Public ---

export const getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      res.status(404);
      throw new Error('Produit introuvable');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// --- Admin ---

export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, pricePerHour } = req.body;

    if (!name || !description || !category || !pricePerHour) {
      res.status(400);
      throw new Error('Champs obligatoires manquants (nom, description, catégorie, prix/heure)');
    }

    const mainPhotoFile = req.files?.mainPhoto?.[0];
    const additionalPhotoFiles = req.files?.additionalPhotos || [];
    const videoFile = req.files?.video?.[0];

    if (!mainPhotoFile) {
      res.status(400);
      throw new Error('Photo principale requise');
    }

    const mainPhotoUrl = await uploadMedia(mainPhotoFile, 'booking/products');
    const additionalPhotos = await Promise.all(
      additionalPhotoFiles.map((file) => uploadMedia(file, 'booking/products'))
    );
    const videoUrl = videoFile ? await uploadMedia(videoFile, 'booking/products') : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        pricePerHour: Number(pricePerHour),
        mainPhotoUrl,
        additionalPhotos,
        videoUrl,
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
      res.status(404);
      throw new Error('Produit introuvable');
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
        additionalPhotoFiles.map((file) => uploadMedia(file, 'booking/products'))
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
      res.status(404);
      throw new Error('Produit introuvable');
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
