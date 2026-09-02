import { formatMessageTime } from '../../utils/formatTime.js';

const MessageBubble = ({ message }) => {
  if (message.type === 'SYSTEM' || message.sender === 'SYSTEM') {
    return (
      <div className="bubble-row">
        <div className="bubble bubble--system">{message.content}</div>
      </div>
    );
  }

  const isSelf = message.sender === 'CLIENT';

  return (
    <div className={`bubble-row${isSelf ? ' self' : ''}`}>
      <div className="bubble">
        {message.type === 'PHOTO' && message.mediaUrl && <img src={message.mediaUrl} alt="" />}
        {message.type === 'VIDEO' && message.mediaUrl && <video src={message.mediaUrl} controls />}
        {message.content && <span>{message.content}</span>}
        <span className="bubble__time">{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
