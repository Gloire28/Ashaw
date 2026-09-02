import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import ProductGallery from '../components/product/ProductGallery.jsx';
import Loader from '../components/common/Loader.jsx';
import { useChat } from '../context/ChatContext.jsx';
import { formatPrice } from '../utils/formatTime.js';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setStartChatProduct } = useChat();

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Chargement du produit…" />;
  if (error || !product) {
    return <p className="page-state">Ce produit n'existe pas ou n'est plus disponible.</p>;
  }

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
            <button className="btn btn--accent" onClick={() => setStartChatProduct(product)}>
              💬 Discuter avec le vendeur
            </button>
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
