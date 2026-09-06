import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';

const ProductLogin = () => {
  const navigate = useNavigate();
  const { login } = useProductAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Connexion – Portail produit</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="field">
          <label>Pseudo</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn--accent" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="register-link">
          Pas encore de compte ? <Link to="/register">Inscris-toi ici</Link>
        </p>
      </form>
    </div>
  );
};

export default ProductLogin;