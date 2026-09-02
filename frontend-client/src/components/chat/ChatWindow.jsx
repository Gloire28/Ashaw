import { useEffect, useRef, useState } from 'react';
import api from '../../services/api.js';
import { useChat } from '../../context/ChatContext.jsx';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import Loader from '../common/Loader.jsx';

const ChatWindow = () => {
  const { openConversationId, closeConversation, socketRef, refreshConversations } = useChat();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!openConversationId) return;

    let cancelled = false;
    setLoading(true);

    api.get(`/api/conversations/${openConversationId}`).then(({ data }) => {
      if (cancelled) return;
      setConversation(data);
      setMessages(data.messages);
      setLoading(false);
    });

    const socket = socketRef.current;
    socket?.emit('join_conversation', openConversationId);

    const handleNewMessage = (message) => {
      if (message.conversationId === openConversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket?.on('new_message', handleNewMessage);

    return () => {
      cancelled = true;
      socket?.off('new_message', handleNewMessage);
    };
  }, [openConversationId, socketRef]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!openConversationId) return null;

  const isExpired = conversation && conversation.status !== 'ACTIVE';

  const handleSend = async ({ content, file }) => {
    setSending(true);
    try {
      if (file) {
        const form = new FormData();
        form.append('media', file);
        await api.post(`/api/messages/${openConversationId}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/api/messages/${openConversationId}`, { content });
      }
      refreshConversations();
    } finally {
      setSending(false);
    }
  };

  const handlePhotoRequest = async () => {
    await api.post(`/api/messages/${openConversationId}/photo-request`);
  };

  return (
    <div className="overlay" onClick={closeConversation}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <Loader label="Ouverture de la discussion…" />
        ) : (
          <>
            <div className="chat-window__header">
              <img src={conversation.product.mainPhotoUrl} alt="" />
              <div>
                <div className="chat-window__title">{conversation.product.name}</div>
                <div className="chat-window__subtitle">
                  {isExpired ? 'Discussion expirée' : 'En discussion avec le vendeur'}
                </div>
              </div>
              <button className="chat-window__close" onClick={closeConversation} aria-label="Fermer">
                ×
              </button>
            </div>

            <div className="chat-window__messages" ref={scrollRef}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>

            {isExpired ? (
              <div className="chat-window__limit">
                Cette discussion a expiré après 5h d'inactivité. Relance une nouvelle discussion
                depuis la fiche produit si besoin.
              </div>
            ) : (
              <div className="chat-window__footer">
                <button className="chat-window__photo-request" onClick={handlePhotoRequest}>
                  📷 Demander plus de photos
                </button>
                <ChatInput onSubmit={handleSend} disabled={sending} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
