import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Loader from '../components/common/Loader.jsx';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Tous');

  useEffect(() => {
    api.get('/api/products').then(({ data }) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['Tous', ...set];
  }, [products]);

  const filtered = category === 'Tous' ? products : products.filter((p) => p.category === category);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
      <h2>Boutique</h2>

      {categories.length > 2 && (
        <div className="shop-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip${cat === category ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader label="Chargement des produits…" />
      ) : filtered.length === 0 ? (
        <p className="empty-shop">Aucun produit disponible pour le moment.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
