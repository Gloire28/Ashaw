import { formatMessageTime } from '../../utils/formatTime.js';

const MessageBubble = ({ message, adminMode = false }) => {
  // Messages système
  if (message.senderType === 'SYSTEM' || message.senderType === 'system') {
    return (
      <div className="bubble-row">
        <div className="bubble bubble--system">{message.content}</div>
      </div>
    );
  }

  // Mode admin : afficher l'expéditeur
  let senderLabel = '';
  if (adminMode) {
    if (message.senderType === 'ADMIN') senderLabel = '👤 Admin';
    else if (message.senderType === 'PRODUCT') senderLabel = '📦 Profil';
  }

  const isSelf = message.senderType === 'ADMIN'; // En mode admin, les messages de l'admin sont "soi"

  return (
    <div className={`bubble-row${isSelf ? ' self' : ''}`}>
      <div className="bubble">
        {adminMode && <div className="bubble__sender" style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', marginBottom: '4px' }}>{senderLabel}</div>}
        {message.mediaUrl && message.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) && <img src={message.mediaUrl} alt="" />}
        {message.mediaUrl && message.mediaUrl.match(/\.(mp4|webm|ogg)/i) && <video src={message.mediaUrl} controls />}
        {message.content && <span>{message.content}</span>}
        <span className="bubble__time">{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;