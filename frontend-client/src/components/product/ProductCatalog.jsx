import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import ProductCard from './ProductCard.jsx';
import Loader from '../common/Loader.jsx';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Erreur lors du chargement du catalogue.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <Loader label="Chargement du catalogue..." />;
  if (error) return <p className="banner">{error}</p>;
  if (products.length === 0) {
    return <p className="empty-shop">Aucun Profil disponible dans cette catégorie.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductCatalog;