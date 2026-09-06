import { useCallback, useEffect, useState } from 'react';
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

  const refresh = useCallback(async () => {
    const params = filter !== 'ALL' ? `?status=${filter}` : '';
    const { data } = await api.get(`/api/admin/conversations${params}`);
    setConversations(data);
  }, [filter]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const socket = socketRef.current;
    const handleChange = () => refresh();
    socket?.on('new_conversation', handleChange);
    socket?.on('conversation_updated', handleChange);
    socket?.on('conversation_deleted', handleChange);
    return () => {
      socket?.off('new_conversation', handleChange);
      socket?.off('conversation_updated', handleChange);
      socket?.off('conversation_deleted', handleChange);
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
          />
          <ConversationDetail
            conversationId={selectedId}
            socketRef={socketRef}
            onChanged={refresh}
          />
        </div>
      )}
    </>
  );
};

export default ConversationsPage;