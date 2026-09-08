import { useEffect, useMemo, useState } from 'react';
import { useProductAuth } from '../context/ProductAuthContext.jsx';
import api from '../services/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Loader from '../components/common/Loader.jsx';

// Mapping pour afficher 'M' à la place de 'N' dans les filtres
const categoryDisplayMap = {
  'F': 'F',
  'N': 'M'
};

// Fonction de mélange aléatoire (Fisher-Yates)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Shop = () => {
  const { isAuthenticated } = useProductAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('Tous');

  useEffect(() => {
    api.get('/api/products').then(({ data }) => {
      // Mélanger les produits aléatoirement
      const shuffled = shuffleArray(data);
      setProducts(shuffled);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['Tous', ...set];
  }, [products]);

  const filtered = categoryFilter === 'Tous'
    ? products
    : products.filter((p) => p.category === categoryFilter);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-6)' }}>
      <h1 style={{ marginBottom: 'var(--space-4)' }}>Match</h1>

      {categories.length > 2 && (
        <div className="shop-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip${cat === categoryFilter ? ' active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'Tous' ? 'Tous' : categoryDisplayMap[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader label="Chargement des profils…" />
      ) : filtered.length === 0 ? (
        <p className="empty-shop">Aucun Profil disponible pour le moment.</p>
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