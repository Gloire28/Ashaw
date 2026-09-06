import prisma from '../config/database.js';
import { getIO } from '../config/socket.js';
import { deleteMedia } from '../services/storage.js';

/**
 * Récupère toutes les conversations (avec filtres possibles sur le statut).
 * GET /api/admin/conversations?status=PENDING|ACTIVE|EXPIRED|DELETED
 */
export const getAllConversationsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ['PENDING', 'ACTIVE', 'EXPIRED', 'DELETED'].includes(status)) {
      where.status = status;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        initiator: true,
        target: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // dernier message pour l'aperçu
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Activer une conversation (passer de PENDING à ACTIVE).
 * Notifie le target (via socket) que la conversation est maintenant active.
 * PATCH /api/admin/conversations/:id/activate
 */
export const activateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { initiator: true, target: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation introuvable.' });
    }

    if (conversation.status !== 'PENDING') {
      return res.status(400).json({ error: 'Cette conversation n\'est pas en attente.' });
    }

    // Vérifier que la conversation n'est pas expirée
    if (conversation.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Cette conversation a expiré.' });
    }

    // Mettre à jour le statut
    const updated = await prisma.conversation.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { initiator: true, target: true, messages: true },
    });

    // Notifier le target (et l'initiator) via socket
    const io = getIO();
    io.to(conversation.targetId).emit('conversation_activated', { conversationId: id });
    io.to(conversation.initiatorId).emit('conversation_activated', { conversationId: id });
    io.to('admin_room').emit('conversation_updated', { conversationId: id });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer définitivement une conversation (et tous ses messages et fichiers).
 * DELETE /api/admin/conversations/:id
 */
export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation introuvable.' });
    }

    // Supprimer les fichiers associés aux messages
    for (const message of conversation.messages) {
      if (message.mediaUrl) {
        try {
          await deleteMedia(message.mediaUrl);
        } catch (err) {
          console.error(`[Admin] Erreur suppression fichier ${message.mediaUrl} :`, err.message);
        }
      }
    }

    // Supprimer la conversation (les messages sont en cascade)
    await prisma.conversation.delete({ where: { id } });

    // Notifier les participants (si sockets actives) que la conversation a disparu
    const io = getIO();
    io.to(conversation.initiatorId).emit('conversation_deleted', { conversationId: id });
    io.to(conversation.targetId).emit('conversation_deleted', { conversationId: id });
    io.to('admin_room').emit('conversation_deleted', { conversationId: id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalProducts,
      activeProducts,
      totalConversations,
      pendingConversations,
      activeConversations,
      expiredConversations,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.conversation.count(),
      prisma.conversation.count({ where: { status: 'PENDING' } }),
      prisma.conversation.count({ where: { status: 'ACTIVE' } }),
      prisma.conversation.count({ where: { status: 'EXPIRED' } }),
    ]);

    res.json({
      totalProducts,
      activeProducts,
      totalConversations,
      pendingConversations,
      activeConversations,
      expiredConversations,
    });
  } catch (error) {
    next(error);
  }
};