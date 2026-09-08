import { useEffect, useRef, useState } from 'react';
import api from '../../services/api.js';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import Loader from '../common/Loader.jsx';

const ConversationView = ({ conversationId, socketRef, onConversationActivated }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Charger la conversation et ses messages
  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/api/conversations/${conversationId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setConversation(data);
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError('Impossible de charger la discussion.');
        setLoading(false);
        console.error('Erreur chargement conversation :', err);
      });

    const socket = socketRef.current;
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }

    return () => {
      cancelled = true;
    };
  }, [conversationId, socketRef]);

  // Écouter les événements socket en temps réel
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        if (message.senderType === 'SYSTEM') {
          api.get(`/api/conversations/${conversationId}`)
            .then(({ data }) => setConversation(data))
            .catch(console.error);
        }
      }
    };

    const handleConversationActivated = () => {
      api.get(`/api/conversations/${conversationId}`)
        .then(({ data }) => {
          setConversation(data);
          setMessages(data.messages || []);
          onConversationActivated?.();
        })
        .catch(console.error);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_activated', handleConversationActivated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_activated', handleConversationActivated);
    };
  }, [conversationId, socketRef, onConversationActivated]);

  // Scroll automatique vers le bas lors de la réception d'un message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async ({ content, file }) => {
    if (!conversationId) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (file) formData.append('file', file);

      await api.post(`/api/messages/${conversationId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error('Erreur envoi message :', err);
      alert(err.response?.data?.error || "Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Chargement de la discussion..." />;
  if (error) return <p className="banner">{error}</p>;
  if (!conversation) return <p className="empty-shop">Discussion introuvable.</p>;

  const isPending = conversation.status === 'PENDING';
  const isActive = conversation.status === 'ACTIVE';
  const isExpired = conversation.status === 'EXPIRED';

  const otherName =
    conversation.initiatorId === conversation.initiator.id
      ? conversation.target.name
      : conversation.initiator.name;

  return (
    <div className="conv-view">
      <div className="conv-view__header">
        <div>
          <h3>Discussion avec {otherName}</h3>
          {isPending && (
            <p style={{ fontSize: '0.8rem', color: 'var(--pending)', marginTop: '2px' }}>
              En attente de validation par l’administrateur.
            </p>
          )}
          {isExpired && (
            <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '2px' }}>
              Cette discussion a expiré.
            </p>
          )}
        </div>
        <span className={`badge badge--${isPending ? 'pending' : isActive ? 'confirm' : 'neutral'}`}>
          {isPending ? 'En attente' : isActive ? 'Active' : 'Expirée'}
        </span>
      </div>

      <div className="conv-view__messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <p className="conv-view__empty">Aucun message pour le moment.</p>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>

      {(isActive || (isPending && conversation.initiatorId === conversation.initiator.id)) && !isExpired && (
        <div className="conv-view__footer">
          <ChatInput onSubmit={handleSend} disabled={sending} />
        </div>
      )}
    </div>
  );
};

export default ConversationView;