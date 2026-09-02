import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
import { useSocket } from '../hooks/useSocket.js';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [startChatProduct, setStartChatProduct] = useState(null); // produit en cours d'ouverture de discussion
  const [openConversationId, setOpenConversationId] = useState(null);
  const [conversationsPanelOpen, setConversationsPanelOpen] = useState(false);
  const socketRef = useSocket();

  const refreshConversations = useCallback(async () => {
    const { data } = await api.get('/api/conversations/mine');
    setConversations(data);
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const startConversation = useCallback(
    async ({ pseudo, age, productId }) => {
      const { data } = await api.post('/api/conversations', { pseudo, age, productId });
      setConversations((prev) => [data, ...prev]);
      setStartChatProduct(null);
      setOpenConversationId(data.id);
      return data;
    },
    []
  );

  const openConversation = useCallback((id) => {
    setOpenConversationId(id);
    setConversationsPanelOpen(false);
  }, []);

  const value = {
    conversations,
    refreshConversations,
    startChatProduct,
    setStartChatProduct,
    startConversation,
    openConversationId,
    openConversation,
    closeConversation: () => setOpenConversationId(null),
    conversationsPanelOpen,
    setConversationsPanelOpen,
    socketRef,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat doit être utilisé dans un ChatProvider');
  return ctx;
};
