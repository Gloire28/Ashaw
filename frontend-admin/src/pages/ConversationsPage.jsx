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
  const [filterBySession, setFilterBySession] = useState(null); 
  const socketRef = useSocket();

  // Regroupe les conversations par sessionId
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

  // Réinitialiser le filtre de session quand on change le filtre général
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'ALL') setFilterBySession(null);
  };

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
            onFilterChange={handleFilterChange}
            selectedId={selectedId}
            onSelect={setSelectedId}
            sessionGroups={sessionGroups}
            filterBySession={filterBySession} 
          />
          <ConversationDetail
            conversationId={selectedId}
            socketRef={socketRef}
            onChanged={refresh}
            sessionGroups={sessionGroups}
            onSelectConversation={setSelectedId}
            onFilterBySession={setFilterBySession} 
          />
        </div>
      )}
    </>
  );
};

export default ConversationsPage;