import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';
import api from '../services/api.js';
import ProductCatalog from '../components/product/ProductCatalog.jsx';
import ConversationView from '../components/chat/ConversationView.jsx';
import Loader from '../components/common/Loader.jsx';
import { useProductSocket } from '../hooks/useProductSocket.js';
import { formatPrice } from '../utils/formatTime.js';

const ProductDashboard = () => {
  const navigate = useNavigate();
  const { product, owner, logout } = useProductAuth();
  const socketRef = useProductSocket();

  const [myProduct, setMyProduct] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(
        'Impossible de charger les données du tableau de bord.'
      );
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

  const handleConversationActivated = useCallback(() => {
    fetchConversations();

    if (selectedConversationId) {
      api
        .get(`/api/conversations/${selectedConversationId}`)
        .then(({ data }) => {
          setSelectedConversationId(data.id);
        })
        .catch(console.error);
    }
  }, [fetchConversations, selectedConversationId]);

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
      socket.off(
        'conversation_activated',
        handleConversationActivated
      );
    };
  }, [
    socketRef,
    fetchConversations,
    handleConversationActivated,
  ]);

  if (loading) {
    return <Loader label="Chargement du tableau de bord..." />;
  }

  if (error) {
    return (
      <div
        className="container"
        style={{
          padding: 'var(--space-5) 0',
        }}
      >
        <p className="banner">{error}</p>
      </div>
    );
  }

  if (!myProduct) {
    return null;
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: 'var(--space-4)',
        paddingBottom: 'var(--space-6)',
      }}
    >
      {/* =========================
          HEADER
      ========================== */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-5)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <h1>Bienvenue, {owner?.username}</h1>

          <p style={{ color: 'var(--ink-soft)' }}>
            Gérez votre profil et vos discussions en direct.
          </p>
        </div>

        <button
          onClick={logout}
          className="btn btn--ghost"
        >
          Se déconnecter
        </button>
      </header>

      {/* =========================
          SECTION MON PRODUIT
      ========================== */}
      <section
        style={{
          marginBottom: 'var(--space-6)',
          background: 'var(--surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--line)',
        }}
      >
        <h2 style={{ marginBottom: 'var(--space-4)' }}>
          Mon Profil
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 280px) 1fr',
            gap: 'var(--space-4)',
            alignItems: 'start',
          }}
        >
          {/* Image principale */}
          <div>
            <img
              src={myProduct.mainPhotoUrl}
              alt={myProduct.name}
              style={{
                width: '100%',
                aspectRatio: '4/3',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-sunken)',
              }}
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </div>

          {/* Informations */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 'var(--space-2)',
              }}
            >
              <h3 style={{ margin: 0 }}>
                {myProduct.name}
              </h3>

              <span
                className={`badge badge--${
                  myProduct.isActive
                    ? 'confirm'
                    : 'neutral'
                }`}
              >
                {myProduct.isActive
                  ? 'Actif'
                  : 'Inactif'}
              </span>
            </div>

            <p
              style={{
                color: 'var(--ink-soft)',
                fontSize: '0.95rem',
              }}
            >
              {myProduct.description}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                fontSize: '0.9rem',
                color: 'var(--ink-soft)',
                marginTop: 'var(--space-1)',
              }}
            >
              <div>
                <strong>Catégorie :</strong>{' '}
                {myProduct.category}
              </div>

              <div>
                <strong>Tarif :</strong>{' '}
                {formatPrice(myProduct.pricePerHour)} FCFA / h
              </div>

              <div>
                <strong>Quartier :</strong>{' '}
                {myProduct.owner?.quartier ||
                  'Non renseigné'}
              </div>

              <div>
                <strong>Âge :</strong>{' '}
                {myProduct.owner?.age
                  ? `${myProduct.owner.age} ans`
                  : 'Non renseigné'}
              </div>
            </div>

            {/* Photos supplémentaires */}
            {myProduct.additionalPhotos?.length > 0 && (
              <div style={{ marginTop: 'var(--space-2)' }}>
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Photos supplémentaires :
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap',
                  }}
                >
                  {myProduct.additionalPhotos.map(
                    (url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt=""
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius:
                            'var(--radius-sm)',
                          background:
                            'var(--surface-sunken)',
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Vidéo */}
            {myProduct.videoUrl && (
              <div style={{ marginTop: 'var(--space-2)' }}>
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Vidéo de présentation :
                </p>

                <video
                  src={myProduct.videoUrl}
                  controls
                  style={{
                    maxWidth: '320px',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          SECTION DISCUSSIONS
          VERSION MOBILE OPTIMISÉE
      ========================== */}
      <section
        style={{
          marginBottom: 'var(--space-6)',
        }}
      >
        <h2>Mes Discussions</h2>

        {conversations.length === 0 ? (
          <p className="empty-shop">
            Aucune discussion pour le moment.
          </p>
        ) : (
          <div
            className={`chat-dashboard-container ${
              selectedConversationId
                ? 'has-selection'
                : ''
            }`}
          >
            {/* =========================
                SIDEBAR CONVERSATIONS
            ========================== */}
            <div className="chat-sidebar">
              <ul className="conversation-list">
                {conversations.map((conv) => {
                  const isInitiator =
                    conv.initiatorId === myProduct.id;

                  const otherProduct = isInitiator
                    ? conv.target
                    : conv.initiator;

                  const isPending =
                    conv.status === 'PENDING';

                  const isActive =
                    conv.status === 'ACTIVE';

                  return (
                    <li
                      key={conv.id}
                      className={`conversation-list__item ${
                        selectedConversationId === conv.id
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setSelectedConversationId(
                          conv.id
                        )
                      }
                    >
                      <div className="conversation-list__info">
                        <span className="conversation-list__name">
                          {isInitiator
                            ? 'Vers'
                            : 'Avec'}{' '}
                          {otherProduct.name}
                        </span>

                        <span
                          className={`badge badge--${
                            isPending
                              ? 'pending'
                              : isActive
                              ? 'confirm'
                              : 'neutral'
                          }`}
                        >
                          {isPending
                            ? 'En attente'
                            : isActive
                            ? 'Active'
                            : 'Expirée'}
                        </span>
                      </div>

                      <div className="conversation-list__meta">
                        <span className="conversation-list__last-message">
                          {conv.messages?.[0]?.content
                            ? conv.messages[0].content.substring(
                                0,
                                40
                              ) + '...'
                            : 'Aucun message'}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* =========================
                ZONE DE DISCUSSION
            ========================== */}
            <div className="chat-main-view">
              {selectedConversationId ? (
                <div className="chat-conversation-wrapper">
                  {/* Retour mobile */}
                  <button
                    className="btn btn--ghost btn--sm chat-back-btn"
                    onClick={() =>
                      setSelectedConversationId(null)
                    }
                    type="button"
                  >
                    ← Retour aux discussions
                  </button>

                  <ConversationView
                    conversationId={
                      selectedConversationId
                    }
                    socketRef={socketRef}
                    onConversationActivated={
                      handleConversationActivated
                    }
                  />
                </div>
              ) : (
                <div className="chat-placeholder">
                  <span>
                    Sélectionnez une discussion pour
                    afficher les messages.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =========================
          MATCHS POSSIBLES
      ========================== */}
      <section>
        <h2>Matchs Possibles</h2>
        <ProductCatalog />
      </section>
    </div>
  );
};

export default ProductDashboard;