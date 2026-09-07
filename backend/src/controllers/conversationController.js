import prisma from '../config/database.js';
import { getIO } from '../config/socket.js';
import { config } from '../config/index.js';
import { isNonEmptyString } from '../utils/validators.js';

// --- Produits (authentifiés par protectProduct) ---

/**
 * Démarrer une conversation entre le produit connecté (initiateur) et un produit cible.
 * Body : { targetProductId, message (texte) }
 */
export const startConversation = async (req, res, next) => {
  try {
    const { targetProductId, message } = req.body;
    const initiatorId = req.productId;

    if (!targetProductId) {
      return res.status(400).json({ error: 'Produit cible requis.' });
    }
    if (!isNonEmptyString(message)) {
      return res.status(400).json({ error: 'Message initial requis.' });
    }

    // Récupérer les deux produits
    const initiator = await prisma.product.findUnique({ where: { id: initiatorId } });
    const target = await prisma.product.findUnique({ where: { id: targetProductId } });

    if (!initiator || !target || !target.isActive) {
      return res.status(404).json({ error: 'Produit cible introuvable ou désactivé.' });
    }

    // Vérifier que les catégories sont différentes
    if (initiator.category === target.category) {
      return res.status(400).json({ error: 'Vous ne pouvez contacter que des produits de catégorie opposée.' });
    }

    // Vérifier qu'il n'existe pas déjà une conversation PENDING ou ACTIVE entre ces deux produits
    const existing = await prisma.conversation.findFirst({
      where: {
        OR: [
          { initiatorId, targetId: targetProductId },
          { initiatorId: targetProductId, targetId: initiatorId },
        ],
        status: { in: ['PENDING', 'ACTIVE'] },
        expiresAt: { gt: new Date() },
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'Une discussion est déjà en cours avec ce produit.' });
    }

    // Créer la conversation
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const adminVisibleUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const conversation = await prisma.conversation.create({
      data: {
        initiatorId,
        targetId: targetProductId,
        status: 'PENDING',
        expiresAt,
        adminVisibleUntil,
        messages: {
          create: {
            senderType: 'PRODUCT',
            senderId: initiatorId,
            content: message.trim(),
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Notifier l'admin en temps réel
    try {
      const io = getIO();
      io.to('admin_room').emit('new_conversation', conversation);
    } catch (_) {
      // Socket non initialisé
    }

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère toutes les conversations visibles pour le produit connecté.
 * Inclut les conversations où il est initiateur ou target, avec statut PENDING ou ACTIVE,
 * et non expirées.
 */
export const getMyConversations = async (req, res, next) => {
  try {
    const productId = req.productId;
    const now = new Date();

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { initiatorId: productId, status: { in: ['PENDING', 'ACTIVE'] } },
          { targetId: productId, status: 'ACTIVE' }, // target ne voit que les ACTIVE
        ],
        expiresAt: { gt: now },
      },
      include: {
        initiator: true,
        target: true,
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une conversation par son ID, avec tous les messages.
 * Seul l'initiateur, le target ou l'admin peuvent y accéder.
 * Vérifie que la conversation est encore visible (non expirée pour les produits).
 */
export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        initiator: true,
        target: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Discussion introuvable.' });
    }

    // Admin voit tout
    if (req.admin) {
      return res.json(conversation);
    }

    // Produit : vérifier qu'il est initiateur ou target, et que la conversation n'est pas expirée
    if (req.productId) {
      const isParticipant = conversation.initiatorId === req.productId || conversation.targetId === req.productId;
      if (!isParticipant) {
        return res.status(403).json({ error: 'Accès refusé.' });
      }
      // Vérifier expiration
      if (conversation.expiresAt < new Date()) {
        return res.status(410).json({ error: 'Cette discussion a expiré.' });
      }
      return res.json(conversation);
    }

    return res.status(401).json({ error: 'Non authentifié.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Envoyer un message dans une conversation (par un produit).
 * Seul le texte est autorisé.
 * Vérifie que le produit est participant et que la conversation est active.
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!isNonEmptyString(content)) {
      return res.status(400).json({ error: 'Message texte requis.' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { initiator: true, target: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Discussion introuvable.' });
    }

    // SI ADMIN : autoriser l'envoi sans restriction de participant
    if (req.admin) {
      // L'admin peut envoyer n'importe quel message (texte uniquement ?)
      // On crée le message avec senderType 'ADMIN'
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderType: 'ADMIN',
          senderId: req.admin.id, // ou null, selon votre schéma
          content: content.trim(),
        },
      });

      // Mettre à jour la date de dernière activité
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      const io = getIO();
      io.to(conversationId).emit('new_message', message);
      io.to('admin_room').emit('conversation_updated', { conversationId });
      return res.status(201).json(message);
    }

    // SINON, produit : vérifications existantes
    const isParticipant = conversation.initiatorId === req.productId || conversation.targetId === req.productId;
    if (!isParticipant) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    if (conversation.status === 'PENDING') {
      if (conversation.initiatorId !== req.productId) {
        return res.status(403).json({ error: 'Cette discussion n\'est pas encore active pour vous.' });
      }
    } else if (conversation.status === 'ACTIVE') {
      // Les deux produits peuvent envoyer
    } else {
      return res.status(403).json({ error: 'Cette discussion n\'est pas active.' });
    }

    if (conversation.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Cette discussion a expiré.' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderType: 'PRODUCT',
        senderId: req.productId,
        content: content.trim(),
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const io = getIO();
    io.to(conversationId).emit('new_message', message);
    io.to('admin_room').emit('conversation_updated', { conversationId });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    // La vérification d'accès est déjà faite par le middleware ou le contrôleur parent
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};