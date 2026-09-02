export const formatMessageTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPrice = (value) => new Intl.NumberFormat('fr-FR').format(value);

export const bookingStatusLabels = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
};

export const bookingStatusBadge = {
  PENDING: 'badge--pending',
  CONFIRMED: 'badge--confirm',
  CANCELLED: 'badge--danger',
  COMPLETED: 'badge--neutral',
};

export const conversationStatusLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archivée',
};
