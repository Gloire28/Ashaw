import prisma from '../config/database.js';

// Créée depuis une conversation : pré-remplit pseudo/âge/produit à partir du chat,
// l'admin ajoute juste la date, l'heure et la durée.
export const createBookingFromConversation = async (conversationId, bookingData) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { product: true },
  });

  if (!conversation) {
    throw new Error('Conversation introuvable');
  }

  return prisma.booking.create({
    data: {
      clientPseudo: bookingData.clientPseudo ?? conversation.clientPseudo,
      clientAge: Number(bookingData.clientAge ?? conversation.clientAge),
      clientContact: bookingData.clientContact ?? null,
      date: new Date(bookingData.date),
      startTime: bookingData.startTime,
      durationHours: Number(bookingData.durationHours),
      notes: bookingData.notes ?? null,
      productId: conversation.productId,
      conversationId: conversation.id,
    },
    include: { product: true },
  });
};

// Créée manuellement par l'admin, sans passer par une conversation
// (ex : réservation prise par téléphone).
export const createManualBooking = async (bookingData) => {
  return prisma.booking.create({
    data: {
      clientPseudo: bookingData.clientPseudo,
      clientAge: Number(bookingData.clientAge),
      clientContact: bookingData.clientContact ?? null,
      date: new Date(bookingData.date),
      startTime: bookingData.startTime,
      durationHours: Number(bookingData.durationHours),
      notes: bookingData.notes ?? null,
      productId: bookingData.productId,
    },
    include: { product: true },
  });
};

export const listBookings = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.productId) where.productId = filters.productId;
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date.gte = new Date(filters.from);
    if (filters.to) where.date.lte = new Date(filters.to);
  }

  return prisma.booking.findMany({
    where,
    include: { product: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
};

export const updateBookingStatus = async (id, status) => {
  return prisma.booking.update({
    where: { id },
    data: { status },
    include: { product: true },
  });
};

export const deleteBooking = async (id) => {
  return prisma.booking.delete({ where: { id } });
};
