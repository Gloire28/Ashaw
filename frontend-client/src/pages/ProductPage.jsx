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
      alert('Votre demande a été envoyée. L\'administrateur va activer la conversation.');
    } catch (err) {
      setContactError(err.response?.data?.error || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Chargement du produit…" />;
  if (error || !product) {
    return <p className="page-state">Ce produit n'existe pas ou n'est plus disponible.</p>;
  }

  const canContact =
    isAuthenticated &&
    myProduct &&
    myProduct.category !== product.category &&
    myProduct.id !== product.id &&
    product.isActive;

  return (
    <div className="container product-page">
      <ProductGallery product={product} />

      <div>
        <div className="product-info__category">{product.category}</div>
        <h1>{product.name}</h1>
        <div className="product-info__price">
          {formatPrice(product.pricePerHour)} FCFA <span>/ heure</span>
        </div>
        <p>{product.description}</p>

        <div className="product-info__actions">
          {product.isActive ? (
            canContact ? (
              <>
                <button className="btn btn--accent" onClick={() => setShowContactForm(true)}>
                  💬 Contacter le propriétaire
                </button>
                {showContactForm && (
                  <div className="contact-form" style={{ marginTop: '16px' }}>
                    <form onSubmit={handleContact}>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Écrivez votre message ici..."
                        rows="4"
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                      />
                      {contactError && <p className="error">{contactError}</p>}
                      <div style={{ display: 'flex', gap: '8px' }}>
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
              <p>
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="btn btn--primary">
                      Connectez-vous
                    </Link>{' '}
                    ou{' '}
                    <Link to="/register" className="btn btn--primary">
                      créez votre compte
                    </Link>{' '}
                    pour contacter les propriétaires.
                  </>
                ) : (
                  <span>Vous ne pouvez pas contacter ce produit (même catégorie ou votre propre produit).</span>
                )}
              </p>
            )
          ) : (
            <p className="product-info__unavailable">
              Ce produit n'est pas disponible à la location pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;