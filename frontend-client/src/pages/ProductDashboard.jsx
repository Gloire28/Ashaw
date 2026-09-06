import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';
import api from '../services/api.js';
import ProductCatalog from '../components/product/ProductCatalog.jsx';
import Loader from '../components/common/Loader.jsx';

const ProductDashboard = () => {
  const navigate = useNavigate();
  const { product, owner, logout } = useProductAuth();
  const [myProduct, setMyProduct] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        // Récupérer son propre produit (pour affichage)
        const productRes = await api.get('/api/products/me');
        setMyProduct(productRes.data);

        // Récupérer ses conversations
        const convRes = await api.get('/api/conversations/mine');
        setConversations(convRes.data);
      } catch (err) {
        console.error('Erreur chargement dashboard :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [product, navigate]);

  if (loading) return <Loader label="Chargement du tableau de bord..." />;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bienvenue, {owner?.username}</h1>
        <button onClick={logout} className="btn btn--ghost">Se déconnecter</button>
      </header>

      <section className="dashboard-my-product">
        <h2>Mon produit</h2>
        {myProduct && (
          <div className="product-card">
            <img src={myProduct.mainPhotoUrl} alt={myProduct.name} className="product-card__image" />
            <div className="product-card__info">
              <h3>{myProduct.name}</h3>
              <p>{myProduct.description}</p>
              <p>Catégorie : {myProduct.category}</p>
              <p>Prix/heure : {myProduct.pricePerHour} €</p>
              <p>Statut : {myProduct.isActive ? 'Actif' : 'Inactif'}</p>
            </div>
          </div>
        )}
      </section>

      <section className="dashboard-catalog">
        <h2>Produits de l'autre catégorie</h2>
        <ProductCatalog />
      </section>

      <section className="dashboard-conversations">
        <h2>Mes discussions</h2>
        {conversations.length === 0 ? (
          <p>Aucune discussion pour le moment.</p>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li key={conv.id}>
                <span>
                  {conv.initiatorId === product.id ? 'Vers' : 'Avec'} {conv.initiatorId === product.id ? conv.target.name : conv.initiator.name}
                </span>
                <span>Statut : {conv.status}</span>
                <span>Expire le : {new Date(conv.expiresAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ProductDashboard;