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
        // Le backend filtre automatiquement par catégorie opposée si le token produit est présent
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
  if (error) return <p className="error">{error}</p>;
  if (products.length === 0) {
    return <p className="info">Aucun produit disponible dans cette catégorie.</p>;
  }

  return (
    <div className="catalog-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductCatalog;