import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatTime.js';

const ProductCard = ({ product }) => (
  <Link to={`/produit/${product.id}`} className="product-card">
    <div className="product-card__media">
      <img src={product.mainPhotoUrl} alt={product.name} loading="lazy" />
    </div>
    <div className="product-card__body">
      <div className="product-card__category">{product.category}</div>
      <div className="product-card__name">{product.name}</div>
      <div className="product-card__price">
        {formatPrice(product.pricePerHour)} FCFA <span>/ heure</span>
      </div>
    </div>
  </Link>
);

export default ProductCard;
