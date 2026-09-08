import { formatMessageTime } from '../../utils/formatTime.js';
import { useProductAuth } from '../../context/ProductAuthContext.jsx';

const MessageBubble = ({ message, adminMode = false }) => {
  const { product } = useProductAuth();

  // Messages système
  if (message.senderType === 'SYSTEM' || message.senderType === 'system') {
    return (
      <div className="bubble-row bubble-row--system">
        <div className="bubble bubble--system">{message.content}</div>
      </div>
    );
  }

  const isAdminMessage = message.senderType === 'ADMIN';
  const isProductMessage = message.senderType === 'PRODUCT';
  const isSelf = isProductMessage && product && message.senderId === product.id;

  let senderLabel = '';
  if (adminMode) {
    if (isAdminMessage) senderLabel = 'Admin';
    else if (isProductMessage) senderLabel = 'Profil';
  }

  return (
    <div className={`bubble-row${!adminMode && isSelf ? ' self' : ''}`}>
      <div className={`bubble${isAdminMessage ? ' bubble--admin' : ''}`}>
        {adminMode && senderLabel && <div className="bubble__sender">{senderLabel}</div>}
        
        {message.mediaUrl && message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) && (
          <img src={message.mediaUrl} alt="Pièce jointe" className="bubble__media" />
        )}
        
        {message.mediaUrl && message.mediaUrl.match(/\.(mp4|webm|ogg)/i) && (
          <video src={message.mediaUrl} controls className="bubble__media" />
        )}

        {message.content && <span>{message.content}</span>}
        
        <span className="bubble__time">{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;