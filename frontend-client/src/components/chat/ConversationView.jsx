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

    // Rejoindre la room de la conversation pour recevoir les messages en temps réel
    const socket = socketRef.current;
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }

    return () => {
      cancelled = true;
    };
  }, [conversationId, socketRef]);

  // Écouter les nouveaux messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        // Mettre à jour le statut si la conversation est activée (changement de status)
        if (message.senderType === 'SYSTEM') {
          // Si on reçoit un message système d'activation, recharger la conversation
          api.get(`/api/conversations/${conversationId}`)
            .then(({ data }) => setConversation(data))
            .catch(console.error);
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_activated', () => {
      // La conversation a été activée, recharger pour voir le nouveau statut
      api.get(`/api/conversations/${conversationId}`)
        .then(({ data }) => {
          setConversation(data);
          setMessages(data.messages || []);
          onConversationActivated?.(); // Notifier le parent pour rafraîchir la liste
        })
        .catch(console.error);
    });

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_activated');
    };
  }, [conversationId, socketRef, onConversationActivated]);

  // Défiler automatiquement vers le bas
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
      alert(err.response?.data?.error || 'Erreur lors de l\'envoi du message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Chargement de la discussion..." />;
  if (error) return <p className="error">{error}</p>;
  if (!conversation) return <p>Discussion introuvable.</p>;

  const isPending = conversation.status === 'PENDING';
  const isActive = conversation.status === 'ACTIVE';
  const isExpired = conversation.status === 'EXPIRED';

  return (
    <div className="conv-view">
      <div className="conv-view__header">
        <h3>
          {conversation.initiatorId === conversation.initiator.id
            ? `Discussion avec ${conversation.target.name}`
            : `Discussion avec ${conversation.initiator.name}`}
        </h3>
        <span className={`badge badge--${isPending ? 'pending' : isActive ? 'confirm' : 'neutral'}`}>
          {isPending ? 'En attente d\'activation' : isActive ? 'Active' : 'Expirée'}
        </span>
        {isPending && (
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginTop: '4px' }}>
            En attente de validation par l’administrateur.
          </p>
        )}
        {isExpired && <p style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Cette discussion a expiré.</p>}
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