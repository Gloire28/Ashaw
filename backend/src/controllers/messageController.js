import prisma from '../config/database.js';
import { touchConversation } from '../services/conversationService.js';
import { uploadMedia } from '../services/storage.js';
import { getIO } from '../config/socket.js';

const resolveSender = (req) => (req.admin ? 'ADMIN' : 'CLIENT');

export const getMessages = async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Route partagée client/admin : identifyAdmin (global) détermine req.admin,
// ce qui fixe l'expéditeur et évite d'avoir deux endpoints séparés.
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const sender = resolveSender(req);

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      res.status(404);
      throw new Error('Discussion introuvable');
    }
    if (!req.admin && conversation.sessionId !== req.headers['x-session-id']) {
      res.status(403);
      throw new Error('Accès refusé');
    }

    let mediaUrl = null;
    let type = 'TEXT';

    if (req.file) {
      mediaUrl = await uploadMedia(req.file, 'booking/chat');
      type = req.file.mimetype.startsWith('video/') ? 'VIDEO' : 'PHOTO';
    }

    if (!content && !mediaUrl) {
      res.status(400);
      throw new Error('Message vide');
    }

    const message = await prisma.message.create({
      data: { conversationId, content: content || null, mediaUrl, type, sender },
    });

    await touchConversation(conversationId);

    const io = getIO();
    io.to(conversationId).emit('new_message', message);
    io.to('admin_room').emit('conversation_updated', { conversationId });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const requestMorePhotos = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || conversation.sessionId !== req.headers['x-session-id']) {
      res.status(403);
      throw new Error('Accès refusé');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        sender: 'SYSTEM',
        type: 'SYSTEM',
        content: 'Le client demande à voir plus de photos du produit.',
      },
    });

    await touchConversation(conversationId);

    const io = getIO();
    io.to(conversationId).emit('new_message', message);
    io.to('admin_room').emit('conversation_updated', { conversationId });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
