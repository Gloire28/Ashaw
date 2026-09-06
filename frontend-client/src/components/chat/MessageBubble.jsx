import { formatMessageTime } from '../../utils/formatTime.js';
import { useProductAuth } from '../../context/ProductAuthContext.jsx';

const MessageBubble = ({ message, adminMode = false }) => {
  // Déterminer si le message est de l'utilisateur connecté (produit ou admin)
  const { product } = useProductAuth();

  // Messages système (anciennement 'SYSTEM')
  if (message.senderType === 'SYSTEM' || message.senderType === 'system') {
    return (
      <div className="bubble-row">
        <div className="bubble bubble--system">{message.content}</div>
      </div>
    );
  }

  // Déterminer l'expéditeur : 'ADMIN' ou 'PRODUCT'
  const isAdminMessage = message.senderType === 'ADMIN';
  const isProductMessage = message.senderType === 'PRODUCT';

  // Pour un produit connecté, déterminer si c'est lui qui a envoyé le message
  const isSelf = isProductMessage && product && message.senderId === product.id;

  // Si mode admin, on affiche différemment (par exemple, l'admin voit tous les messages sans notion de "soi")
  // On peut adapter l'affichage selon le contexte.
  let senderLabel = '';
  if (adminMode) {
    if (isAdminMessage) senderLabel = 'Admin';
    else if (isProductMessage) {
      // On pourrait afficher le nom du produit, mais on ne l'a pas ici.
      // On peut afficher un label générique "Produit"
      senderLabel = 'Produit';
    }
  }

  return (
    <div className={`bubble-row${!adminMode && isSelf ? ' self' : ''}`}>
      <div className="bubble">
        {/* Afficher le label de l'expéditeur en mode admin */}
        {adminMode && <div className="bubble__sender">{senderLabel}</div>}
        {/* Afficher le contenu multimédia */}
        {message.mediaUrl && message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) && <img src={message.mediaUrl} alt="" />}
        {message.mediaUrl && message.mediaUrl.match(/\.(mp4|webm|ogg)/i) && <video src={message.mediaUrl} controls />}
        {message.content && <span>{message.content}</span>}
        <span className="bubble__time">{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;