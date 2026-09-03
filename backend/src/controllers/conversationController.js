import prisma from '../config/database.js';
import { generateUUID } from '../utils/generateUUID.js';
import { isValidAge, isNonEmptyString } from '../utils/validators.js';
import { config } from '../config/index.js';
import {
  countActiveConversations,
  createConversation,
  getActiveConversationsForSession,
} from '../services/conversationService.js';
import { getIO } from '../config/socket.js';

// --- Public (client) ---

export const startConversation = async (req, res, next) => {
  try {
    const { pseudo, age, productId } = req.body;

    if (!isNonEmptyString(pseudo)) {
      res.status(400);
      throw new Error('Pseudo requis');
    }
    if (!isValidAge(age)) {
      res.status(400);
      throw new Error('Âge invalide (entre 13 et 120 ans)');
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Produit introuvable');
    }

    // Le sessionId est généré côté client (localStorage) et envoyé en header —
    // plus de cookie cross-site, bloqué par défaut sur Safari/iOS.
    let sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      sessionId = generateUUID();
    }

    const activeCount = await countActiveConversations(sessionId);
    if (activeCount >= config.maxActiveConversations) {
      res.status(409);
      throw new Error(
        `Limite atteinte : ${config.maxActiveConversations} discussions actives maximum. Attends qu'une discussion expire ou soit clôturée.`
      );
    }

    const conversation = await createConversation({
      sessionId,
      clientPseudo: pseudo.trim(),
      clientAge: age,
      productId,
    });

    try {
      getIO().to('admin_room').emit('new_conversation', conversation);
    } catch (_error) {
      // socket pas encore initialisé : sans impact sur la création
    }

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.json([]);
    }
    const conversations = await getActiveConversationsForSession(sessionId);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { product: true, messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      res.status(404);
      throw new Error('Discussion introuvable');
    }
    // Un client ne peut ouvrir que ses propres discussions ; l'admin voit tout.
    if (!req.admin && conversation.sessionId !== sessionId) {
      res.status(403);
      throw new Error('Accès refusé');
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

// --- Admin ---

export const getAllConversationsAdmin = async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        product: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastActivityAt: 'desc' },
    });
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const archiveConversation = async (req, res, next) => {
  try {
    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });
    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [activeProducts, activeConversations, pendingConversations, todayMessages] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.conversation.count({ where: { status: 'ACTIVE' } }),
        prisma.conversation.count({ where: { status: 'ACTIVE', messages: { none: {} } } }),
        prisma.message.count({ where: { createdAt: { gte: startOfDay } } }),
      ]);

    res.json({ activeProducts, activeConversations, pendingConversations, todayMessages });
  } catch (error) {
    next(error);
  }
};
