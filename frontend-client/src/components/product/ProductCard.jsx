import { Link } from 'react-router-dom';
import { useProductAuth } from '../../context/ProductAuthContext.jsx';
import { formatPrice } from '../../utils/formatTime.js';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useProductAuth();

  return (
    <Link to={`/produit/${product.id}`} className="product-card">
      <div className="product-card__media">
        <img src={product.mainPhotoUrl} alt={product.name} loading="lazy" />
        {!product.isActive && (
          <div className="product-card__unavailable">Indisponible</div>
        )}
      </div>
      <div className="product-card__body">
        <div className="product-card__name">{product.name}</div>
        {isAuthenticated ? (
          <>
            <div className="product-card__category">{product.category}</div>
            <div className="product-card__price">
              {formatPrice(product.pricePerHour)} FCFA <span>/ h</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginTop: 'auto' }}>
            🔒 Connectez-vous pour voir plus
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;