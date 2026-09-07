import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';
import api from '../services/api.js';
import ProductCatalog from '../components/product/ProductCatalog.jsx';
import ConversationView from '../components/chat/ConversationView.jsx';
import Loader from '../components/common/Loader.jsx';
import { useProductSocket } from '../hooks/useProductSocket.js';

const ProductDashboard = () => {
  const navigate = useNavigate();
  const { product, owner, logout } = useProductAuth();
  const socketRef = useProductSocket();

  const [myProduct, setMyProduct] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const convRes = await api.get('/api/conversations/mine');
      setConversations(convRes.data);
    } catch (err) {
      console.error('Erreur chargement conversations :', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!product) return;
    setLoading(true);
    try {
      const productRes = await api.get('/api/products/me');
      setMyProduct(productRes.data);
      await fetchConversations();
      setError(null);
    } catch (err) {
      console.error('Erreur chargement dashboard :', err);
      setError('Impossible de charger les données du tableau de bord.');
    } finally {
      setLoading(false);
    }
  }, [product, fetchConversations]);

  useEffect(() => {
    if (!product) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [product, navigate, fetchData]);

  // Rafraîchir les conversations après activation
  const handleConversationActivated = useCallback(() => {
    fetchConversations();
    // Recharger la conversation sélectionnée pour mettre à jour le statut
    if (selectedConversationId) {
      api.get(`/api/conversations/${selectedConversationId}`)
        .then(({ data }) => setSelectedConversationId(data.id))
        .catch(console.error);
    }
  }, [fetchConversations, selectedConversationId]);

  // Écouter les événements socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewConversation = () => {
      fetchConversations();
    };

    const handleConversationUpdated = () => {
      fetchConversations();
    };

    socket.on('new_conversation', handleNewConversation);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('conversation_activated', handleConversationActivated);

    return () => {
      socket.off('new_conversation', handleNewConversation);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('conversation_activated', handleConversationActivated);
    };
  }, [socketRef, fetchConversations, handleConversationActivated]);

  if (loading) return <Loader label="Chargement du tableau de bord..." />;
  if (error) return <p className="error">{error}</p>;
  if (!myProduct) return <p>Aucun produit trouvé.</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bienvenue, {owner?.username}</h1>
        <button onClick={logout} className="btn btn--ghost">Se déconnecter</button>
      </header>

      <section className="dashboard-my-product">
        <h2>Mon produit</h2>
        <div className="product-card">
          <img
            src={myProduct.mainPhotoUrl}
            alt={myProduct.name}
            className="product-card__image"
            onError={(e) => { e.target.src = '/placeholder-image.png'; }}
          />
          <div className="product-card__info">
            <h3>{myProduct.name}</h3>
            <p>{myProduct.description}</p>
            <p>Catégorie : {myProduct.category}</p>
            <p>Prix / heure : {myProduct.pricePerHour} €</p>
            <p>Statut : {myProduct.isActive ? '✅ Actif' : '❌ Inactif'}</p>
            <p>Propriétaire : {myProduct.owner?.username}</p>
            <p>Âge : {myProduct.owner?.age} ans</p>
            <p>Quartier : {myProduct.owner?.quartier}</p>

            {myProduct.additionalPhotos?.length > 0 && (
              <div className="additional-photos">
                <p>Photos supplémentaires :</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {myProduct.additionalPhotos.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Photo supplémentaire ${idx + 1}`}
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                    />
                  ))}
                </div>
              </div>
            )}

            {myProduct.videoUrl && (
              <div className="video">
                <p>Vidéo :</p>
                <video src={myProduct.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </div>
            )}
          </div>
        </div>
        <button className="btn btn--accent" style={{ marginTop: '16px' }}>
          ✏️ Modifier mon produit
        </button>
      </section>

      <section className="dashboard-catalog">
        <h2>Produits de l'autre catégorie</h2>
        <ProductCatalog />
      </section>

      <section className="dashboard-conversations">
        <h2>Mes discussions</h2>
        {conversations.length === 0 ? (
          <p>Aucune discussion pour le moment.</p>
        ) : (
          <div className="dashboard-conversations__layout">
            <ul className="conversation-list">
              {conversations.map((conv) => {
                const isInitiator = conv.initiatorId === myProduct.id;
                const otherProduct = isInitiator ? conv.target : conv.initiator;
                const isPending = conv.status === 'PENDING';
                const isActive = conv.status === 'ACTIVE';
                const isExpired = conv.status === 'EXPIRED';

                return (
                  <li
                    key={conv.id}
                    className={`conversation-list__item ${
                      selectedConversationId === conv.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <div className="conversation-list__info">
                      <span className="conversation-list__name">
                        {isInitiator ? 'Vers' : 'Avec'} {otherProduct.name}
                      </span>
                      <span className={`badge badge--${isPending ? 'pending' : isActive ? 'confirm' : 'neutral'}`}>
                        {isPending ? 'En attente' : isActive ? 'Active' : 'Expirée'}
                      </span>
                    </div>
                    <div className="conversation-list__meta">
                      <span className="conversation-list__last-message">
                        {conv.messages?.[0]?.content
                          ? conv.messages[0].content.substring(0, 60) + '...'
                          : 'Aucun message'}
                      </span>
                      <span className="conversation-list__expires">
                        Expire le : {new Date(conv.expiresAt).toLocaleString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="conversation-view-container">
              {selectedConversationId ? (
                <ConversationView
                  conversationId={selectedConversationId}
                  socketRef={socketRef}
                  onConversationActivated={handleConversationActivated}
                />
              ) : (
                <p className="conv-view__empty">Sélectionnez une discussion pour la consulter.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDashboard;