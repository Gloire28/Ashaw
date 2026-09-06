import prisma from '../config/database.js';
import { getIO } from '../config/socket.js';
import { uploadMedia } from '../services/storage.js';

/**
 * Récupère les messages d'une conversation.
 * Utilisé par l'admin ou le produit participant (vérification faite par le contrôleur de conversation).
 */
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

/**
 * Envoyer un message dans une conversation.
 * - Si req.admin est présent, l'expéditeur est ADMIN.
 * - Si req.productId est présent, l'expéditeur est PRODUCT (et il doit être participant).
 * - Seul l'admin peut envoyer des fichiers (media).
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const file = req.file;

    // 1. Récupérer la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation introuvable.' });
    }

    // 2. Déterminer l'expéditeur
    let senderType;
    let senderId;
    if (req.admin) {
      senderType = 'ADMIN';
      senderId = req.admin.id;
    } else if (req.productId) {
      senderType = 'PRODUCT';
      senderId = req.productId;
      // Vérifier que le produit est initiateur ou target
      if (conversation.initiatorId !== req.productId && conversation.targetId !== req.productId) {
        return res.status(403).json({ error: 'Accès refusé.' });
      }
      // Vérifier que la conversation est active (non PENDING)
      if (conversation.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Cette discussion n\'est pas encore active.' });
      }
    } else {
      return res.status(401).json({ error: 'Non authentifié.' });
    }

    // 3. Gestion des fichiers (seul l'admin peut en envoyer)
    let mediaUrl = null;
    if (file) {
      if (!req.admin) {
        return res.status(403).json({ error: 'Seul l\'admin peut envoyer des fichiers.' });
      }
      mediaUrl = await uploadMedia(file, 'booking/chat');
    }

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: 'Message vide.' });
    }

    // 4. Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        content: content || null,
        mediaUrl,
        senderType,
        senderId,
      },
    });

    // 5. Mettre à jour la date de dernière activité
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // 6. Notifier via Socket.IO
    const io = getIO();
    io.to(conversationId).emit('new_message', message);
    io.to('admin_room').emit('conversation_updated', { conversationId });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// La fonction requestMorePhotos n'est plus utilisée dans le nouveau système.
// Si vous souhaitez la conserver, il faudrait l'adapter, mais elle n'est plus pertinente.