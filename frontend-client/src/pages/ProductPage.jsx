import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import ProductGallery from '../components/product/ProductGallery.jsx';
import Loader from '../components/common/Loader.jsx';
import { useProductAuth } from '../context/ProductAuthContext.jsx';
import { formatPrice } from '../utils/formatTime.js';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const { isAuthenticated, product: myProduct } = useProductAuth();

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setContactError('');
    try {
      await api.post('/api/conversations', {
        targetProductId: product.id,
        message: message.trim(),
      });
      setShowContactForm(false);
      setMessage('');
      alert("Votre demande a été envoyée. L'administrateur va activer la conversation.");
    } catch (err) {
      setContactError(err.response?.data?.error || "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Chargement du Profil…" />;
  if (error || !product) {
    return <p className="page-state">Ce Profil n'existe pas ou n'est plus disponible.</p>;
  }

  const canContact =
    isAuthenticated &&
    myProduct &&
    myProduct.category !== product.category &&
    myProduct.id !== product.id &&
    product.isActive;

  return (
    <div className="container product-page">
      {/* Galerie complète : visible UNIQUEMENT pour les connectés */}
      {isAuthenticated ? (
        <ProductGallery product={product} />
      ) : (
        // Pour les non-connectés : afficher UNIQUEMENT la photo principale
        <div className="gallery__main">
          <img
            src={product.mainPhotoUrl}
            alt={product.name}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      )}

      <div>
        {/* Nom du produit : visible pour tous */}
        <h1 style={{ marginBottom: 'var(--space-2)' }}>{product.name}</h1>

        {isAuthenticated ? (
          <>
            {/* Informations complètes pour les connectés */}
            <div className="product-info__category">Catégorie {product.category}</div>
            <div className="product-info__price">
              {formatPrice(product.pricePerHour)} FCFA <span>/ heure</span>
            </div>

            <div className="product-info__actions" style={{ marginTop: 'var(--space-4)' }}>
              {product.isActive ? (
                canContact ? (
                  <>
                    {!showContactForm ? (
                      <button className="btn btn--accent" onClick={() => setShowContactForm(true)}>
                        💬 Match rapide
                      </button>
                    ) : (
                      <div style={{ background: 'var(--surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                        <form onSubmit={handleContact}>
                          <div className="field">
                            <label htmlFor="contact-message">Votre message</label>
                            <textarea
                              id="contact-message"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Écrivez votre message ici..."
                              rows="4"
                              required
                            />
                          </div>
                          {contactError && <div className="banner">{contactError}</div>}
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button type="submit" className="btn btn--accent" disabled={sending}>
                              {sending ? 'Envoi...' : 'Envoyer'}
                            </button>
                            <button type="button" className="btn btn--ghost" onClick={() => setShowContactForm(false)}>
                              Annuler
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'var(--ink-faint)', fontSize: '0.9rem' }}>
                    <span>Vous ne pouvez pas contacter ce Profil (même catégorie ou votre propre Profil).</span>
                  </p>
                )
              ) : (
                <p className="product-info__unavailable">
                  Ce Profil n'est pas disponible à la location pour le moment.
                </p>
              )}
            </div>
          </>
        ) : (
          // Message pour non-connectés : seulement le nom et la photo principale
          <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: 'var(--space-2)' }}>
              🔒 Connectez-vous pour voir le prix et contacter le propriétaire.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn--accent btn--sm">
                Se connecter
              </Link>
              <Link to="/register" className="btn btn--ghost btn--sm">
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;