import prisma from '../config/database.js';
import { deleteMedia } from './storage.js';
import { getIO } from '../config/socket.js';

/**
 * Service exécuté périodiquement (toutes les heures) pour :
 * 1. Passer en EXPIRED les conversations dont expiresAt est dépassé.
 * 2. Supprimer définitivement les conversations dont adminVisibleUntil est dépassé
 *    ou dont le statut est DELETED, et supprimer leurs fichiers associés.
 */
export const startCleanupJobs = () => {
  // Exécution toutes les heures
  setInterval(async () => {
    const now = new Date();

    try {
      // 1. Expiration des conversations pour les produits (24h)
      const expiredConversations = await prisma.conversation.updateMany({
        where: {
          status: { in: ['PENDING', 'ACTIVE'] },
          expiresAt: { lt: now },
        },
        data: { status: 'EXPIRED' },
      });
      if (expiredConversations.count > 0) {
        console.log(`[Cleanup] ${expiredConversations.count} conversations expirées.`);
        // Notifier l'admin des expirations (optionnel)
        const io = getIO();
        io.to('admin_room').emit('conversations_cleaned');
      }

      // 2. Suppression définitive des conversations dont le délai admin est dépassé (30j)
      //    ou marquées DELETED.
      const toDelete = await prisma.conversation.findMany({
        where: {
          OR: [
            { adminVisibleUntil: { lt: now } },
            { status: 'DELETED' },
          ],
        },
        include: {
          messages: true,
        },
      });

      for (const conv of toDelete) {
        // Supprimer les fichiers hébergés sur Backblaze (via storage.js)
        for (const message of conv.messages) {
          if (message.mediaUrl) {
            try {
              await deleteMedia(message.mediaUrl);
            } catch (err) {
              console.error(`[Cleanup] Erreur suppression fichier ${message.mediaUrl} :`, err.message);
            }
          }
        }
        // Supprimer la conversation (les messages sont supprimés en cascade)
        await prisma.conversation.delete({ where: { id: conv.id } });
        console.log(`[Cleanup] Conversation ${conv.id} supprimée définitivement.`);
      }
    } catch (error) {
      console.error('[Cleanup] Erreur dans le job de nettoyage :', error);
    }
  }, 60 * 60 * 1000); // 1 heure
};