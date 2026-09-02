import prisma from '../config/database.js';
import { config } from '../config/index.js';

export const countActiveConversations = async (sessionId) => {
  return prisma.conversation.count({
    where: { sessionId, status: 'ACTIVE' },
  });
};

export const createConversation = async ({ sessionId, clientPseudo, clientAge, productId }) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.sessionDurationHours * 60 * 60 * 1000);

  return prisma.conversation.create({
    data: {
      sessionId,
      clientPseudo,
      clientAge: Number(clientAge),
      productId,
      lastActivityAt: now,
      expiresAt,
    },
    include: { product: true },
  });
};

// Renouvelle la session à chaque action (envoi de message, ouverture) —
// 5h glissantes tant qu'il y a de l'activité.
export const touchConversation = async (conversationId) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.sessionDurationHours * 60 * 60 * 1000);

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { lastActivityAt: now, expiresAt, status: 'ACTIVE' },
  });
};

export const getActiveConversationsForSession = async (sessionId) => {
  return prisma.conversation.findMany({
    where: { sessionId, status: 'ACTIVE' },
    include: {
      product: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { lastActivityAt: 'desc' },
  });
};
