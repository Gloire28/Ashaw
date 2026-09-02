export const formatMessageTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const formatPrice = (value) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};
