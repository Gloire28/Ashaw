import cron from 'node-cron';
import prisma from '../config/database.js';
import { config } from '../config/index.js';

const expireInactiveConversations = async () => {
  const now = new Date();
  await prisma.conversation.updateMany({
    where: { status: 'ACTIVE', expiresAt: { lt: now } },
    data: { status: 'INACTIVE' },
  });
};

const purgeOldConversations = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - config.trashRetentionDays);

  await prisma.conversation.deleteMany({
    where: {
      status: { in: ['INACTIVE', 'ARCHIVED'] },
      lastActivityAt: { lt: cutoff },
    },
  });
};

export const startCleanupJobs = () => {
  // Toutes les 10 minutes : passe en "inactive" les conversations sans activité depuis 5h
  cron.schedule('*/10 * * * *', expireInactiveConversations);

  // Une fois par jour à 3h du matin : purge définitive après 30 jours en corbeille
  cron.schedule('0 3 * * *', purgeOldConversations);
};
