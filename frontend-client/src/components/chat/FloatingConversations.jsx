import { useChat } from '../../context/ChatContext.jsx';

const FloatingConversations = () => {
  const { conversations, conversationsPanelOpen, setConversationsPanelOpen, openConversation } =
    useChat();

  if (conversations.length === 0) return null;

  return (
    <div className="floating-chats">
      {conversationsPanelOpen && (
        <div className="floating-chats__panel">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className="floating-chats__item"
              onClick={() => openConversation(conv.id)}
            >
              <img src={conv.product.mainPhotoUrl} alt="" />
              <span>
                <span className="floating-chats__item-name">{conv.product.name}</span>
                <span className="floating-chats__item-last">
                  {conv.messages?.[0]?.content || 'Aucun message pour le moment'}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        className="floating-chats__button"
        onClick={() => setConversationsPanelOpen((v) => !v)}
      >
        💬 Mes discussions
        <span className="floating-chats__count">{conversations.length}</span>
      </button>
    </div>
  );
};

export default FloatingConversations;
