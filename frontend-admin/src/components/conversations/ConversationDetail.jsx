import { useEffect, useRef, useState } from 'react';
import api from '../../services/api.js';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import BookingFormModal from '../bookings/BookingFormModal.jsx';
import Loader from '../common/Loader.jsx';
import { conversationStatusLabels } from '../../utils/formatTime.js';

const ConversationDetail = ({
  conversationId,
  socketRef,
  onChanged,
  sessionGroups = {},
  onSelectConversation,
}) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSaved, setBookingSaved] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setLoading(true);
    setBookingSaved(false);

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

  const handleSend = async ({ content, file }) => {
    setSending(true);
    try {
      if (file) {
        const form = new FormData();
        form.append('media', file);
        await api.post(`/api/messages/${conversationId}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/api/messages/${conversationId}`, { content });
      }
    } finally {
      setSending(false);
    }
  };

  const handleArchive = async () => {
    await api.patch(`/api/conversations/${conversationId}/archive`);
    setConversation((prev) => ({ ...prev, status: 'ARCHIVED' }));
    onChanged?.();
  };

  return (
    <div className="conv-detail">
      <div className="conv-detail__header">
        <img src={conversation.product.mainPhotoUrl} alt="" />
        <div>
          <div className="conv-detail__title">
            {conversation.clientPseudo} · {conversation.clientAge} ans
          </div>
          <div className="conv-detail__subtitle">
            {conversation.product.name} — {conversationStatusLabels[conversation.status]}
          </div>
        </div>
        <div className="conv-detail__header-actions">
          {conversation.status !== 'ARCHIVED' && (
            <button className="btn btn--ghost btn--sm" onClick={handleArchive}>
              Archiver
            </button>
          )}
          <button
            className="btn btn--accent btn--sm"
            onClick={() => setBookingModalOpen(true)}
            disabled={bookingSaved}
          >
            {bookingSaved ? 'Réservation créée ✓' : '📅 Créer une réservation'}
          </button>
        </div>
      </div>

      {(() => {
        const siblings = (sessionGroups[conversation.sessionId] || []).filter(
          (c) => c.id !== conversationId
        );
        if (siblings.length === 0) return null;
        return (
          <div className="banner" style={{ borderLeftColor: 'var(--ink-faint)', background: 'var(--surface-sunken)' }}>
            Même session navigateur — {siblings.length} autre{siblings.length > 1 ? 's' : ''}{' '}
            discussion{siblings.length > 1 ? 's' : ''} :{' '}
            {siblings.map((s, i) => (
              <span key={s.id}>
                <button
                  className="btn btn--ghost btn--sm"
                  style={{ padding: '0.1em 0.6em', marginLeft: '4px' }}
                  onClick={() => onSelectConversation?.(s.id)}
                >
                  {s.product.name}
                </button>
                {i < siblings.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        );
      })()}

      <div className="conv-detail__messages" ref={scrollRef}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <div className="conv-detail__footer">
        <ChatInput onSubmit={handleSend} disabled={sending} />
      </div>

      {bookingModalOpen && (
        <BookingFormModal
          conversation={conversation}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => {
            setBookingModalOpen(false);
            setBookingSaved(true);
          }}
        />
      )}
    </div>
  );
};

export default ConversationDetail;
