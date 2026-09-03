import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import ConversationsList from '../components/conversations/ConversationsList.jsx';
import ConversationDetail from '../components/conversations/ConversationDetail.jsx';
import Loader from '../components/common/Loader.jsx';
import { useSocket } from '../hooks/useSocket.js';

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const socketRef = useSocket();

  // Regroupe les conversations par sessionId : permet de repérer qu'un même
  // visiteur (même session navigateur) a ouvert plusieurs discussions.
  // Limite honnête : quelqu'un qui vide ses cookies/localStorage ou passe en
  // navigation privée obtient un sessionId différent — ça ne détecte que les
  // cas non délibérés, pas un contournement volontaire.
  const sessionGroups = useMemo(() => {
    const groups = {};
    conversations.forEach((conv) => {
      if (!groups[conv.sessionId]) groups[conv.sessionId] = [];
      groups[conv.sessionId].push(conv);
    });
    return groups;
  }, [conversations]);

  const refresh = useCallback(async () => {
    const { data } = await api.get('/api/conversations/admin/all');
    setConversations(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const socket = socketRef.current;
    const handleChange = () => refresh();
    socket?.on('new_conversation', handleChange);
    socket?.on('conversation_updated', handleChange);
    return () => {
      socket?.off('new_conversation', handleChange);
      socket?.off('conversation_updated', handleChange);
    };
  }, [socketRef, refresh]);

  return (
    <>
      <div className="section-head">
        <h2>Conversations</h2>
      </div>

      {loading ? (
        <Loader label="Chargement des conversations…" />
      ) : (
        <div className="conv-layout">
          <ConversationsList
            conversations={conversations}
            filter={filter}
            onFilterChange={setFilter}
            selectedId={selectedId}
            onSelect={setSelectedId}
            sessionGroups={sessionGroups}
          />
          <ConversationDetail
            conversationId={selectedId}
            socketRef={socketRef}
            onChanged={refresh}
            sessionGroups={sessionGroups}
            onSelectConversation={setSelectedId}
          />
        </div>
      )}
    </>
  );
};

export default ConversationsPage;
