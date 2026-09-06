import { useEffect, useRef, useState } from 'react';
import api from '../../services/api.js';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import Loader from '../common/Loader.jsx';
import { conversationStatusLabels } from '../../utils/formatTime.js';

const ConversationDetail = ({
  conversationId,
  socketRef,
  onChanged,
}) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setLoading(true);

    api.get(`/api/conversations/${conversationId}`).then(({ data }) => {
      if (cancelled) return;
      setConversation(data);
      setMessages(data.messages);
      setLoading(false);
    });

    const socket = socketRef.current;
    socket?.emit('join_conversation', conversationId);

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket?.on('new_message', handleNewMessage);

    return () => {
      cancelled = true;
      socket?.off('new_message', handleNewMessage);
    };
  }, [conversationId, socketRef]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleActivate = async () => {
    try {
      await api.patch(`/api/admin/conversations/${conversationId}/activate`);
      onChanged?.();
    } catch (error) {
      alert('Erreur lors de l\'activation : ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette conversation ? Les messages et fichiers seront supprimés.')) return;
    try {
      await api.delete(`/api/admin/conversations/${conversationId}`);
      onChanged?.();
    } catch (error) {
      alert('Erreur lors de la suppression : ' + (error.response?.data?.error || error.message));
    }
  };

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
    } catch (error) {
      alert('Erreur lors de l\'envoi : ' + (error.response?.data?.error || error.message));
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="conv-detail">
        <div className="conv-detail__empty">Sélectionne une conversation dans la liste.</div>
      </div>
    );
  }

  if (loading || !conversation) {
    return (
      <div className="conv-detail">
        <Loader label="Ouverture…" />
      </div>
    );
  }

  return (
    <div className="conv-detail">
      <div className="conv-detail__header">
        <img src={conversation.initiator.mainPhotoUrl} alt="" />
        <div>
          <div className="conv-detail__title">
            {conversation.initiator.name} ({conversation.initiator.category}) → {conversation.target.name} ({conversation.target.category})
          </div>
          <div className="conv-detail__subtitle">
            Statut : {conversationStatusLabels[conversation.status] || conversation.status}
            {conversation.status !== 'DELETED' && (
              <> • Expire le : {new Date(conversation.expiresAt).toLocaleString()}</>
            )}
          </div>
        </div>
        <div className="conv-detail__header-actions">
          {conversation.status === 'PENDING' && (
            <button className="btn btn--accent btn--sm" onClick={handleActivate}>
              ✅ Activer
            </button>
          )}
          {conversation.status !== 'DELETED' && (
            <button className="btn btn--danger btn--sm" onClick={handleDelete}>
              🗑️ Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="conv-detail__participants" style={{ fontSize: '0.85rem', color: 'var(--ink-faint)', padding: '8px 16px', background: 'var(--surface-sunken)' }}>
        Initiateur: {conversation.initiator.name} (ID: {conversation.initiatorId}) | 
        Cible: {conversation.target.name} (ID: {conversation.targetId})
      </div>

      <div className="conv-detail__messages" ref={scrollRef}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} adminMode />
        ))}
      </div>

      {conversation.status !== 'DELETED' && conversation.status !== 'EXPIRED' && (
        <div className="conv-detail__footer">
          <ChatInput onSubmit={handleSend} disabled={sending} />
        </div>
      )}
    </div>
  );
};

export default ConversationDetail;